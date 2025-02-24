import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, acct } = req.query;

  if (!server || !acct) {
    return res.status(400).json({
      error: 'server, acct are required for marking posts as seen',
    });
  }

  try {
    const updatedCount = dbManager.markAccountsAsSeen(
      server as string,
      acct as string
    );
    res.status(200).json({
      message: 'Posts marked as seen',
      updatedCount,
    });
  } catch (error) {
    console.error('Error marking posts as seen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}