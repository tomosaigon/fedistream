import { DatabaseManager } from '../../db/database';
import { getServerBySlug } from '../../config/servers';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { server, offset = '0', limit = '20', onlyCounts = 'false' } = req.query;

  if (!server) {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  const serverConfig = getServerBySlug(server as string);
  if (!serverConfig) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    const counts = dbManager.getCategoryCounts(server as string);

    if (onlyCounts === 'true') {
      return res.status(200).json({ counts });
    }

    const buckets = dbManager.getBucketedPosts(
      server as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.status(200).json({ buckets, counts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to fetch posts from database",
      ...(onlyCounts === 'true' ? {
        counts: {
          nonEnglish: 0,
          withImages: 0,
          asReplies: 0,
          networkMentions: 0,
          withLinks: 0,
          remaining: 0
        }
      } : {
        buckets: {
          nonEnglish: [],
          withImages: [],
          asReplies: [],
          networkMentions: [],
          withLinks: [],
          remaining: []
        },
        counts: {
          nonEnglish: 0,
          withImages: 0,
          asReplies: 0,
          networkMentions: 0,
          withLinks: 0,
          remaining: 0
        }
      })
    });
  }
}