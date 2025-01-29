// pages/api/export-database.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { DatabaseManager } from '@/db/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const dbManager = new DatabaseManager();
      const outputDir = path.resolve(process.cwd(), 'db/exports');
      dbManager.exportDatabase(outputDir);
      console.log(`Database exported successfully to ${outputDir}`);
      return res.status(200).json({ success: true, message: 'Database export started successfully.' });
    } catch (error) {
      return res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
