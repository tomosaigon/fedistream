import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';
import { mastodonStatusToPost, MastodonStatus } from '../../db/mastodonStatus';

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
  // TODO client can pass in access token
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

  // console.log('as curl: ', `curl -H "Authorization: Bearer ${token}" ${timelineUrl}`); 
  const response = await axios.get(timelineUrl, config);

  return response.data;
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, older, delete: deleteFlag, batch = 1 } = req.query;

  // Handle database reset first
  // For non-delete operations, require server parameter
  if (deleteFlag === 'true') {
    if (server) {
      dbManager.resetDatabase(server as string);
      return res.status(200).json({ 
        message: `Database reset for server: ${server}` 
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

  if (isNaN(Number(batch)) || Number(batch) < 1) {
    return res.status(400).json({ error: 'Invalid batch parameter' });
  }

  try {
    const batchCount = parseInt(batch as string, 10);
    let totalNewPosts = 0;
    let firstPost: MastodonStatus | null = null;
    let lastPost: MastodonStatus | null = null;

    for (let i = 0; i < batchCount; i++) {
      let newPosts = [];
      const isHomeServer = server === '$HOME';
      const fetchOptions = isHomeServer ? { home: true } : {};
      const baseUrl =
        server === 'test-server' // XXX mock
          ? 'https://example.com'
          : dbManager.getAllServers().find((s) => s.slug === server)?.uri;

      if (!baseUrl) {
        return res.status(404).json({ error: 'Server not found' });
      }

      if (older === 'true') {
        const oldestPostId = dbManager.getOldestPostId(server as string);
        newPosts = await fetchTimelinePage(baseUrl, {
          maxId: oldestPostId,
          ...fetchOptions,
        });
      } else {
        const latestPostId = dbManager.getLatestPostId(server as string);
        newPosts = await fetchTimelinePage(baseUrl, {
          minId: latestPostId,
          ...fetchOptions,
        });
      }

      if (newPosts.length > 0) {
        // Set the firstPost and lastPost if not already set
        if (!firstPost) firstPost = newPosts[0];
        lastPost = newPosts[newPosts.length - 1];

        // Store new posts in the database
        newPosts.forEach((post: MastodonStatus) => {
          post.was_reblogged = 0;
          if (post.reblog) {
            post.reblog.was_reblogged = 1;
            dbManager.insertPost(mastodonStatusToPost(post.reblog, server as string));
          }
          dbManager.insertPost(mastodonStatusToPost(post, server as string));
        });
        totalNewPosts += newPosts.length;
      }

      totalNewPosts += newPosts.length;

      // Stop early if fewer posts than a typical batch size were returned
      if (newPosts.length < 40) break;
    }

    res.status(200).json({
      message: `Synced ${totalNewPosts} posts across ${batchCount} batch(es)`,
      newPosts: totalNewPosts,
      firstPost: firstPost
        ? { id: firstPost.id, created_at: firstPost.created_at }
        : null,
      lastPost: lastPost
        ? { id: lastPost.id, created_at: lastPost.created_at }
        : null,
    });
  } catch (error) {
    console.error('Error syncing posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
