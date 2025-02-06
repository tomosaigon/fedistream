import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, id, saved} = req.query;

  if (!server || !id || !saved) {
    return res.status(400).json({
      error: 'server, id, and saved are required for saving posts',
    });
  }

  try {
    const updatedCount = dbManager.markPostSaved(
      server as string,
      id as string,
      saved === 'true' ? true : false);
    res.status(200).json({
      message: 'Posts marked as saved',
      updatedCount,
    });
  } catch (error) {
    console.error('Error marking posts as saved:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}