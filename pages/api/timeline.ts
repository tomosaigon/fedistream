import { getCategoryBySlug } from '@/db/categories';
import { DatabaseManager } from '@/db/database';

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

  if (!server || typeof server !== 'string') {
    return res.status(400).json({ error: 'Server slug is required' });
  }

  const counts = dbManager.getCategoryCounts(server as string);

  if (onlyCounts === 'true') {
    return res.status(200).json({ counts });
  }

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category is required' });
  }
  const { bucket } = getCategoryBySlug(category);

  // Get posts for specific category
  const posts = dbManager.getBucketedPostsByCategory(
    server,
    bucket,
    parseInt(limit as string),
    parseInt(offset as string)
  );

  // Normalize response by wrapping posts in buckets object
  const buckets = {
    [category as string]: posts
  };

  return res.status(200).json({ buckets, counts });
}