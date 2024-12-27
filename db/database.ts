import Database from 'better-sqlite3';

// auto
// dotenv.config({ path: join(process.cwd(), '.env.local') });

export class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.DATABASE_FILE || 'mastodon.db';
    console.log('Database path:', dbPath);
    this.db = new Database(dbPath);
    
    if (!this.tableExists('posts')) {
      this.initializeSchema();
    }
  }

  private tableExists(tableName: string): boolean {
    const result = this.db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
    ).get(tableName);
    return !!result;
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT,
        in_reply_to_id TEXT,
        url TEXT,
        account_id TEXT,
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
      CREATE INDEX IF NOT EXISTS idx_posts_account_id ON posts(account_id);

      CREATE TABLE account_tags (
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        tag TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        UNIQUE(user_id, tag)
      );

      CREATE INDEX IF NOT EXISTS idx_account_tags_user_id ON account_tags(user_id);
      CREATE INDEX IF NOT EXISTS idx_account_tags_tag ON account_tags(tag);
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
      const tables = ['account_tags', 'posts'];
      tables.forEach(table => {
        this.db.exec(`DROP TABLE IF EXISTS ${table}`);
      });
      this.initializeSchema();
    }
  }

  public insertPost(post: Post) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO posts (
        id, created_at, content, language, in_reply_to_id, url,
        account_id, account_username, account_display_name, account_url, account_avatar,
        media_attachments, visibility, favourites_count, reblogs_count, replies_count,
        server_slug, bucket, card
      ) VALUES (
        @id, @created_at, @content, @language, @in_reply_to_id, @url,
        @account_id, @account_username, @account_display_name, @account_url, @account_avatar,
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
      const posts = this.db.prepare(`
        SELECT p.*, GROUP_CONCAT(at.tag) as account_tags
        FROM posts p
        LEFT JOIN account_tags at ON p.account_id = at.user_id
        WHERE p.server_slug = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?
      `).all(serverSlug, limit, offset) as (Post & { account_tags: string | null })[];

      const buckets: BucketedPosts = {
        nonEnglish: [],
        withImages: [],
        asReplies: [],
        networkMentions: [],
        withLinks: [],
        remaining: []
      };

      posts.forEach(post => {
        const mediaAttachments = JSON.parse(post.media_attachments as string);
        const postWithTags = {
          ...post,
          media_attachments: mediaAttachments,
          account_tags: post.account_tags ? post.account_tags.split(',') : []
        };

        if (post.language !== 'en') {
          buckets.nonEnglish.push(postWithTags);
        }
        else if (mediaAttachments?.length > 0) {
          buckets.withImages.push(postWithTags);
        }
        else if (post.in_reply_to_id) {
          buckets.asReplies.push(postWithTags);
        }
        else if (isOnlyMentionsOrTags(post.content)) {
          buckets.networkMentions.push(postWithTags);
        }
        else if (post.content.includes('<a href="')) {
          buckets.withLinks.push(postWithTags);
        }
        else {
          buckets.remaining.push(postWithTags);
        }
      });

      return buckets;
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

  public tagAccount(userId: string, username: string, tag: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO account_tags (user_id, username, tag)
      VALUES (@userId, @username, @tag)
      ON CONFLICT(user_id, tag) DO UPDATE SET
      count = count + 1
    `);

    stmt.run({ userId, username, tag });
  }

  public getAccountTags(userId: string): AccountTag[] {
    const stmt = this.db.prepare(`
      SELECT tag, count
      FROM account_tags 
      WHERE user_id = ?
      ORDER BY count DESC
    `);

    const rows = stmt.all(userId) as Pick<AccountTag, 'tag' | 'count'>[];

    return rows.map(row => ({
      tag: row.tag,
      count: row.count
    }));
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
  account_id: string;         /* Add account_id field */
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

interface AccountTag {
  tag: string;
  count: number;
}

