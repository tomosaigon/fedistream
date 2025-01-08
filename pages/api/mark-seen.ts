import { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../db';
import { getServerBySlug } from '../../config/servers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, seenFrom, seenTo, bucket } = req.query;

  if (!server || !seenFrom || !seenTo || !bucket) {
    return res.status(400).json({
      error: 'server, seenFrom, seenTo, and bucket are required for marking posts as seen',
    });
  }

  const serverConfig = getServerBySlug(server as string);
  if (!serverConfig) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    const updatedCount = dbManager.markPostsAsSeen(
      server as string,
      bucket as string,
      seenFrom as string,
      seenTo as string
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