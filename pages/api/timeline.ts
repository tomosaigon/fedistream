import { DatabaseManager, BucketedPosts } from '../../db/database';
import { getServerBySlug } from '../../config/servers';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    server,
    offset = '0',
    limit = '20',
    onlyCounts = 'false',
    category
  } = req.query;

  if (!server) {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  const serverConfig = getServerBySlug(server as string);
  if (!serverConfig) {
    return res.status(404).json({ error: 'Server not found' });
  }

  const counts = dbManager.getCategoryCounts(server as string);

  if (onlyCounts === 'true') {
    return res.status(200).json({ counts });
  }

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  // Get posts for specific category
  const posts = dbManager.getBucketedPostsByCategory(
    server as string,
    category as keyof BucketedPosts,
    parseInt(limit as string),
    parseInt(offset as string)
  );

  // Normalize response by wrapping posts in buckets object
  const buckets = {
    [category as string]: posts
  };

  return res.status(200).json({ buckets, counts });
}