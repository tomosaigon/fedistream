import axios from 'axios';
import { getServerBySlug } from '../../config/servers';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';
import { Poll, Post } from '../../db/database';

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

async function fetchTimelinePage(baseUrl: string, options?: { 
  maxId?: string; 
  minId?: string; 
  home?: boolean; 
}) {
  const params = {
    local: true,
    limit: 40,
    ...(options?.maxId && { max_id: options.maxId }),
    ...(options?.minId && { min_id: options.minId })
  };

  // Fetch the access token if we are fetching the home timeline
  let token = '';
  if (options?.home) {
    // Get the access token using the baseUrl
    token = dbManager.getTokenByServer(baseUrl) || '';
    if (!token) {
      throw new Error('Access token not found for the given server URL');
    }
  }

  const queryString = new URLSearchParams(params as unknown as Record<string, string>).toString();
  let timelineUrl = `${baseUrl}/api/v1/timelines/public?${queryString}`;

  if (options?.home) {
    timelineUrl = `${baseUrl}/api/v1/timelines/home?${queryString}`;
  }

  console.log('Fetching timeline page with query:', timelineUrl);

  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    : {}; // Only add the Authorization header if there's a token

  const response = await axios.get(timelineUrl, config);

  return response.data;
}

interface MastodonAccount {
  id: string;
  username: string;
  // acct - full
  display_name: string;
  url: string;
  avatar: string;
  bot: boolean;
}

// aka Status
interface MastodonPost {
  id: string;
  created_at: string;
  content: string;
  language: string;
  in_reply_to_id: string | null;
  uri: string;
  url: string;
  account: MastodonAccount;
  media_attachments: any[];
  visibility: string;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
  card: any | null;
  poll: Poll | null;
  // reblogged_id: string | null;
  reblog: MastodonPost | null;
}

function mastodonPostToPost(mastodonPost: MastodonPost, serverSlug: string): Post {
  return {
    ...mastodonPost,
    seen: 0,
    account_id: mastodonPost.account.id,
    account_username: mastodonPost.account.username,
    account_display_name: mastodonPost.account.display_name,
    account_url: mastodonPost.account.url,
    account_avatar: mastodonPost.account.avatar,
    account_bot: mastodonPost.account.bot,
    server_slug: serverSlug,
    bucket: '',
    account_tags: [],
    poll: mastodonPost.poll ? mastodonPost.poll : null,
    parent_id: mastodonPost.reblog ? mastodonPost.reblog.id : null,
    reblog: mastodonPost.reblog ? mastodonPostToPost(mastodonPost.reblog, serverSlug) : null,
    // reblogged_at: mastodonPost.reblog ? mastodonPost.reblog.created_at : null,
    // reblog: mastodonPost.reblog ? mastodonPostToPost(mastodonPost.reblog, serverSlug) : null,
    // reblogged_id: mastodonPost.reblog,
    // poll: mastodonPost.poll ? {
    //   id: mastodonPost.poll.id,
    //   options: mastodonPost.poll.options.map(option => ({
    //     label: option.label,
    //     votes: option.votes,
    //   })),
    //   votes_count: mastodonPost.poll.votes_count,
    //   expires_at: mastodonPost.poll.expires_at,
    // } : null,
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

    // Check if the server is $HOME
    const isHomeServer = serverConfig.slug === '$HOME';

    // Set home option to true if the server is $HOME
    const fetchOptions = isHomeServer ? { home: true } : {};

    if (older === 'true') {
      const oldestPostId = dbManager.getOldestPostId(server as string);
      console.log('Oldest post ID:', oldestPostId);
      
      if (oldestPostId) {
        const posts = await fetchTimelinePage(serverConfig.baseUrl, { maxId: oldestPostId, ...fetchOptions });
        newPosts = posts;
      } else {
        const posts = await fetchTimelinePage(serverConfig.baseUrl, fetchOptions);
        newPosts = posts;
      }
    } else {
      const latestPostId = dbManager.getLatestPostId(server as string);
      console.log('Latest post ID:', latestPostId);

      if (latestPostId) {
        const posts = await fetchTimelinePage(serverConfig.baseUrl, { minId: latestPostId, ...fetchOptions });
        newPosts = posts;
      } else {
        const posts = await fetchTimelinePage(serverConfig.baseUrl, fetchOptions);
        newPosts = posts;
      }
    }

    // Store new posts in database
    newPosts.forEach((post: MastodonPost) => {
      // console.log('Inserting post:', post);
      if (post.reblog) {
        // console.log('Reblogged post:', post.reblog);
        dbManager.insertPost(mastodonPostToPost(post.reblog, server as string));

      }
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

