// pages/api/tag-account.ts
import { DatabaseManager } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, username, tag, server } = req.body;

  if (!userId || !username || !tag || !server) {
    return res.status(400).json({ 
      error: 'Missing required fields: userId, username, tag, and server are required' 
    });
  }

  try {
    if (req.method === 'DELETE') {
      dbManager.clearAccountTag(userId, tag, server);
      return res.status(200).json({ 
        message: `Cleared tag ${tag} from @${username}`,
        tags: dbManager.getAccountTags(userId)
      });
    }

    // Existing POST logic
    dbManager.tagAccount(userId, username, tag, server);
    return res.status(200).json({ 
      message: `Tagged @${username} as ${tag} on server ${server}`,
      tags: dbManager.getAccountTags(userId)
    });
  } catch (error) {
    console.error('Error managing account tag:', error);
    return res.status(500).json({ error: 'Failed to manage account tag' });
  }
}