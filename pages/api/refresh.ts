import axios from 'axios';
// import { DatabaseManager } from '../../db/database';
import { getServerBySlug } from '../../config/servers';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, older, delete: deleteFlag } = req.query;
  if (!server) {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  const serverConfig = getServerBySlug(server as string);
  if (!serverConfig) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    // Handle delete operation
    if (deleteFlag === 'true') {
      dbManager.resetDatabase(server as string);
      return res.status(200).json({ 
        message: `Database reset for server: ${serverConfig.slug}` 
      });
    }

    // Existing refresh logic
    console.log('Refreshing posts for server:', serverConfig.slug);
    let newPosts = [];
    
    if (older === 'true') {
      const oldestPost = dbManager.getOldestPost(server as string);
      console.log('Oldest post:', oldestPost);
      
      if (oldestPost) {
        const posts = await fetchTimelinePage(serverConfig.baseUrl, { minId: oldestPost.id });
        newPosts = posts;
      } else {
        const posts = await fetchTimelinePage(serverConfig.baseUrl);
        newPosts = posts;
      }
    } else {
      const latestPost = dbManager.getLatestPost(server as string);
      console.log('Latest post:', latestPost);
      
      if (latestPost) {
        const posts = await fetchTimelinePage(serverConfig.baseUrl, { maxId: latestPost.id });
        newPosts = posts;
      } else {
        const posts = await fetchTimelinePage(serverConfig.baseUrl);
        newPosts = posts;
      }
    }

    // Store new posts in database
    newPosts.forEach((post: any) => {
      dbManager.insertPost({
        id: post.id,
        created_at: post.created_at,
        content: post.content,
        language: post.language,
        in_reply_to_id: post.in_reply_to_id,
        url: post.url,
        account_username: post.account.username,
        account_display_name: post.account.display_name,
        account_url: post.account.url,
        account_avatar: post.account.avatar,
        media_attachments: post.media_attachments,
        visibility: post.visibility,
        favourites_count: post.favourites_count,
        reblogs_count: post.reblogs_count,
        replies_count: post.replies_count,
        server_slug: server as string,
      });
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

