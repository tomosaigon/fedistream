// pages/api/tag-account.ts
import { DatabaseManager } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, username, tag } = req.body;

  if (!userId || !username || !tag) {
    return res.status(400).json({ 
      error: 'Missing required fields: userId, username, and tag are required' 
    });
  }

  try {
    dbManager.tagAccount(userId, username, tag);
    
    const tags = dbManager.getAccountTags(userId);
    
    return res.status(200).json({ 
      message: `Tagged @${username} as ${tag}`,
      tags 
    });
  } catch (error) {
    console.error('Error tagging account:', error);
    return res.status(500).json({ error: 'Failed to tag account' });
  }
}