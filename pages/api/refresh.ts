import axios from 'axios';
// import { DatabaseManager } from '../../db/database';
import { getServerBySlug } from '../../config/servers';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';

async function fetchTimelinePage(baseUrl: string, maxId?: string) {
  const params = {
    local: true,
    limit: 40,
    ...(maxId && { max_id: maxId })
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

  const { server } = req.query;
  if (!server) {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  const serverConfig = getServerBySlug(server as string);
  if (!serverConfig) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    console.log('Refreshing posts for server:', serverConfig.slug);
    const latestPost = dbManager.getLatestPost(server as string);
    console.log('Latest post:', latestPost);
    let newPosts = [];
    
    if (latestPost) {
      const posts = await fetchTimelinePage(serverConfig.baseUrl, latestPost.id);
      newPosts = posts;
    } else {
      const posts = await fetchTimelinePage(serverConfig.baseUrl);
      newPosts = posts;
    }

    // console.log('New posts:', newPosts);
    // Store new posts in database
    newPosts.forEach((post: { id: any; created_at: any; content: any; language: any; in_reply_to_id: any; url: any; account: { username: any; display_name: any; url: any; avatar: any; }; media_attachments: any; visibility: any; favourites_count: any; reblogs_count: any; replies_count: any; }) => {
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
        server_slug: serverConfig.slug
      });
    });

    res.status(200).json({ 
      message: `Stored ${newPosts.length} new posts`,
      newPosts: newPosts.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to refresh posts" });
  }
}

