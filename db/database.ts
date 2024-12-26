import Database from 'better-sqlite3';

// auto
// dotenv.config({ path: join(process.cwd(), '.env.local') });

export class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.DATABASE_FILE || 'mastodon.db';
    console.log('Database path:', dbPath);
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT,
        in_reply_to_id TEXT,
        url TEXT,
        account_username TEXT NOT NULL,
        account_display_name TEXT NOT NULL,
        account_url TEXT,
        account_avatar TEXT,
        media_attachments TEXT NOT NULL DEFAULT '[]',
        visibility TEXT,
        favourites_count INTEGER DEFAULT 0,
        reblogs_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        server_slug TEXT NOT NULL,
        bucket TEXT NOT NULL,
        card TEXT,
        UNIQUE(id, server_slug)
      );

      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
      CREATE INDEX IF NOT EXISTS idx_posts_account_username ON posts(account_username);
      CREATE INDEX IF NOT EXISTS idx_posts_server_slug ON posts(server_slug);
    `);
  }

  private determineBucket(post: Post): string {
    let mediaAttachments = [];
    
    try {
      if (typeof post.media_attachments === 'string') {
        mediaAttachments = JSON.parse(post.media_attachments);
      } else if (Array.isArray(post.media_attachments)) {
        mediaAttachments = post.media_attachments;
      }
    } catch (error) {
      console.warn('Failed to parse media_attachments:', error);
      mediaAttachments = [];
    }
    
    if (post.language !== 'en') return 'nonEnglish';
    if (mediaAttachments?.length > 0) return 'withImages';
    if (post.in_reply_to_id) return 'asReplies';
    if (isOnlyMentionsOrTags(post.content)) return 'networkMentions';
    if (post.content.includes('<a href="')) return 'withLinks';
    return 'remaining';
  }

  public resetDatabase(serverSlug?: string) {
    if (serverSlug) {
      this.db.prepare('DELETE FROM posts WHERE server_slug = ?').run(serverSlug);
    } else {
      this.db.exec(`
        DROP TABLE IF EXISTS posts;

        CREATE TABLE posts (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          content TEXT NOT NULL,
          language TEXT,
          in_reply_to_id TEXT,
          url TEXT,
          account_username TEXT NOT NULL,
          account_display_name TEXT NOT NULL,
          account_url TEXT,
          account_avatar TEXT,
          media_attachments TEXT NOT NULL DEFAULT '[]',
          visibility TEXT,
          favourites_count INTEGER DEFAULT 0,
          reblogs_count INTEGER DEFAULT 0,
          replies_count INTEGER DEFAULT 0,
          server_slug TEXT NOT NULL,
          bucket TEXT NOT NULL,
          card TEXT,
          UNIQUE(id, server_slug)
        );
      `);
    }
  }

  public insertPost(post: Post) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO posts (
        id, created_at, content, language, in_reply_to_id, url,
        account_username, account_display_name, account_url, account_avatar,
        media_attachments, visibility, favourites_count, reblogs_count, replies_count,
        server_slug, bucket, card
      ) VALUES (
        @id, @created_at, @content, @language, @in_reply_to_id, @url,
        @account_username, @account_display_name, @account_url, @account_avatar,
        @media_attachments, @visibility, 
        COALESCE(@favourites_count, 0),
        COALESCE(@reblogs_count, 0),
        COALESCE(@replies_count, 0),
        @server_slug, @bucket, @card
      )
    `);

    const postData = {
      ...post,
      media_attachments: Array.isArray(post.media_attachments) 
        ? JSON.stringify(post.media_attachments)
        : post.media_attachments || '[]',
      card: post.card ? JSON.stringify(post.card) : null, // Stringify card object
      bucket: this.determineBucket(post)
    };

    return stmt.run(postData);
  }

  public getLatestPost(serverSlug: string): Post | undefined {
    return this.db.prepare(
      'SELECT * FROM posts WHERE server_slug = ? ORDER BY id DESC LIMIT 1'
    ).get(serverSlug) as Post | undefined;
  }

  public getOldestPost(serverSlug: string): Post | undefined {
    return this.db.prepare(
      'SELECT * FROM posts WHERE server_slug = ? ORDER BY id ASC LIMIT 1'
    ).get(serverSlug) as Post | undefined;
  }

  public getBucketedPosts(serverSlug: string, limit: number = 20, offset: number = 0): BucketedPosts {
    const emptyBuckets: BucketedPosts = {
      nonEnglish: [],
      withImages: [],
      asReplies: [],
      networkMentions: [],
      withLinks: [],
      remaining: []
    };

    try {
      // Query posts for each bucket
      Object.keys(emptyBuckets).forEach(bucket => {
        const posts = this.db.prepare(
          'SELECT * FROM posts WHERE server_slug = ? AND bucket = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).all(serverSlug, bucket, limit, offset) as Post[];

        emptyBuckets[bucket as keyof BucketedPosts] = posts.map(post => {
          try {
            return {
              ...post,
              media_attachments: JSON.parse(post.media_attachments as string),
              card: post.card ? JSON.parse(post.card as unknown as string) : null
            };
          } catch (error) {
            console.warn('Failed to parse post data:', error);
            return {
              ...post,
              media_attachments: [],
              card: null
            };
          }
        });
      });

      return emptyBuckets;
    } catch (error) {
      console.error('Error in getBucketedPosts:', error);
      return emptyBuckets;
    }
  }

  public getPostCounts(serverSlug: string): Record<string, number> {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM posts WHERE server_slug = ?').get(serverSlug) as { count: number };
    return {
      total: result?.count || 0
    };
  }

  public getCategoryCounts(serverSlug: string): Record<string, number> {
    const posts = this.db.prepare('SELECT * FROM posts WHERE server_slug = ?').all(serverSlug) as Post[];
    
    const counts = {
      nonEnglish: 0,
      withImages: 0,
      asReplies: 0,
      networkMentions: 0,
      withLinks: 0,
      remaining: 0
    };

    posts.forEach(post => {
      const mediaAttachments = JSON.parse(post.media_attachments as string);
      
      if (post.language !== 'en') counts.nonEnglish++;
      else if (mediaAttachments?.length > 0) counts.withImages++;
      else if (post.in_reply_to_id) counts.asReplies++;
      else if (isOnlyMentionsOrTags(post.content)) counts.networkMentions++;
      else if (post.content.includes('<a href="')) counts.withLinks++;
      else counts.remaining++;
    });

    return counts;
  }
}

function isOnlyMentionsOrTags(content: string): boolean {
  // Get all links from the content
  const links = content.match(/<a[^>]*>.*?<\/a>/g) || [];
  
  // If there are no links, it's not a network mention post
  if (links.length === 0) return false;

  // Check each link
  return links.every(link => {
    // Check for hashtag format
    if (link.includes('class="mention hashtag"') || link.includes('class="hashtag"')) {
      return link.includes('>#<span>');
    }
    // Check for mention format
    else if (link.includes('class="u-url mention"')) {
      return link.includes('>@<span>');
    }
    // If it contains spans with 'invisible' class, it's an external link
    else if (link.includes('class="invisible"')) {
      return false;
    }
    // Any other type of link
    return false;
  });
}

export interface Post {
  id: string;
  created_at: string;
  content: string;
  language: string;
  in_reply_to_id: string | null;
  url: string;
  account_username: string;
  account_display_name: string;
  account_url: string;
  account_avatar: string;
  media_attachments: string | any[];
  visibility: string;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
  server_slug: string;
  card?: {
    url: string;
    title: string;
    description: string;
    image?: string;
    author_name?: string;
  } | null;
}

interface BucketedPosts {
  nonEnglish: Post[];
  withImages: Post[];
  asReplies: Post[];
  networkMentions: Post[];
  withLinks: Post[];
  remaining: Post[];
}

