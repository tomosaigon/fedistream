import { NextApiRequest, NextApiResponse } from 'next';
import { Bucket } from '@/db/bucket';
import { DatabaseManager } from '../../db/database';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { server } = req.query;

  if (!server) {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  try {
    // Fetch server stats from the database
    const stats = dbManager.getServerStats(server as string) as {
      totalPosts: number;
      seenPosts: number;
      oldestPostDate: string | null;
      latestPostDate: string | null;
      categoryCounts: Record<Bucket, { seen: number; unseen: number }>;
    };

    if (!stats) {
      return res.status(404).json({ error: 'Stats not found for the specified server' });
    }

    return res.status(200).json({ ...stats });
  } catch (error) {
    console.error('Error fetching server stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}