import axios from 'axios';
import { getServerBySlug } from '../../config/servers';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';
import { Post } from '../../db/database';

// https://docs.joinmastodon.org/methods/timelines/
// local
// Boolean. Show only local statuses? Defaults to false.
// remote
// Boolean. Show only remote statuses? Defaults to false.
// only_media
// Boolean. Show only statuses with media attached? Defaults to false.
// max_id
// String. All results returned will be lesser than this ID. In effect, sets an upper bound on results.
// since_id
// String. All results returned will be greater than this ID. In effect, sets a lower bound on results.
// min_id
// String. Returns results immediately newer than this ID. In effect, sets a cursor at this ID and paginates forward.
// limit
// Integer. Maximum number of results to return. Defaults to 20 statuses. Max 40 statuses.

async function fetchTimelinePage(baseUrl: string, options?: { maxId?: string; minId?: string }) {
  const params = {
    local: true,
    limit: 40,
    ...(options?.maxId && { max_id: options.maxId }),
    ...(options?.minId && { min_id: options.minId })
  };

  const queryString = new URLSearchParams(params as unknown as Record<string, string>).toString();
  console.log('Fetching timeline page with query:', `${baseUrl}/api/v1/timelines/public?${queryString}`);
  const response = await axios.get(
    `${baseUrl}/api/v1/timelines/public?${queryString}`
  );

  return response.data;
}

// Add interfaces
interface MastodonAccount {
  id: string;
  username: string;
  display_name: string;
  url: string;
  avatar: string;
}

interface MastodonPost {
  id: string;
  created_at: string;
  content: string;
  language: string;
  in_reply_to_id: string | null;
  url: string;
  account: MastodonAccount;
  media_attachments: any[];
  visibility: string;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
  card: any | null;
}

function mastodonPostToPost(mastodonPost: MastodonPost, serverSlug: string): Post {
  return {
    ...mastodonPost,
    account_id: mastodonPost.account.id,
    account_username: mastodonPost.account.username,
    account_display_name: mastodonPost.account.display_name,
    account_url: mastodonPost.account.url,
    account_avatar: mastodonPost.account.avatar,
    server_slug: serverSlug,
    bucket: '',
    account_tags: []
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, older, delete: deleteFlag } = req.query;

  // Handle database reset first
  // For non-delete operations, require server parameter
  if (deleteFlag === 'true') {
    if (server) {
      const serverConfig = getServerBySlug(server as string);
      if (!serverConfig) {
        return res.status(404).json({ error: 'Server not found' });
      }
      dbManager.resetDatabase(server as string);
      return res.status(200).json({ 
        message: `Database reset for server: ${serverConfig.slug}` 
      });
    } else {
      dbManager.resetDatabase();
      return res.status(200).json({ 
        message: 'Database reset completely' 
      });
    }
  }

  if (!server) {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  const serverConfig = getServerBySlug(server as string);
  if (!serverConfig) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    console.log('Refreshing posts for server:', serverConfig.slug);
    let newPosts = [];
    
    if (older === 'true') {
      const oldestPostId = dbManager.getOldestPostId(server as string);
      console.log('Oldest post ID:', oldestPostId);
      
      if (oldestPostId) {
        // All results returned will be lesser than this ID. In effect, sets an upper bound on results.
        const posts = await fetchTimelinePage(serverConfig.baseUrl, { maxId: oldestPostId });
        newPosts = posts;
      } else {
        const posts = await fetchTimelinePage(serverConfig.baseUrl);
        newPosts = posts;
      }
    } else {
      const latestPostId = dbManager.getLatestPostId(server as string);
      console.log('Latest post ID:', latestPostId);
      
      if (latestPostId) {
        // Returns results immediately newer than this ID. In effect, sets a cursor at this ID and paginates forward.
        const posts = await fetchTimelinePage(serverConfig.baseUrl, { minId: latestPostId });
        newPosts = posts;
      } else {
        const posts = await fetchTimelinePage(serverConfig.baseUrl);
        newPosts = posts;
      }
    }

    // Store new posts in database
    newPosts.forEach((post: MastodonPost) => {
      dbManager.insertPost(mastodonPostToPost(post, server as string));
    });

    const firstPost = newPosts[0];
    const lastPost = newPosts[newPosts.length - 1];

    res.status(200).json({ 
      message: `Stored ${newPosts.length} new posts`,
      newPosts: newPosts.length,
      firstPost: {
        id: firstPost?.id,
        created_at: firstPost?.created_at
      },
      lastPost: {
        id: lastPost?.id,
        created_at: lastPost?.created_at
      }
    });
  } catch (error) {
    console.error('Error refreshing posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

