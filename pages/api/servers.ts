import { DatabaseManager } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const servers = dbManager.fetchAllMastodonServers();
      return res.status(200).json({ servers });
    } catch (error) {
      console.error('Error fetching Mastodon servers:', error);
      return res.status(500).json({ error: 'Failed to fetch Mastodon servers' });
    }
  }

  if (req.method === 'POST') {
    const { uri, slug, name, enabled } = req.body;

    if (
      !uri ||
      !slug ||
      !name ||
      typeof uri !== 'string' ||
      typeof slug !== 'string' ||
      typeof name !== 'string' ||
      typeof enabled !== 'boolean'
    ) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
      const wasInserted = dbManager.insertMastodonServer(uri, slug, name, enabled);
      if (wasInserted) {
        return res.status(201).json({ message: 'Server added successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to add server' });
      }
    } catch (error) {
      console.error('Error adding server:', error);
      return res.status(500).json({ error: 'Failed to add server' });
    }
  }

  if (req.method === 'PUT') {
    const { id, uri, slug, name, enabled } = req.body;

    if (
      !id ||
      !uri ||
      !slug ||
      !name ||
      typeof id !== 'number' ||
      typeof uri !== 'string' ||
      typeof slug !== 'string' ||
      typeof name !== 'string' ||
      typeof enabled !== 'boolean'
    ) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
      const wasUpdated = dbManager.updateMastodonServer(id, uri, slug, name, enabled);
      if (wasUpdated) {
        return res.status(200).json({ message: 'Server updated successfully' });
      } else {
        return res.status(404).json({ error: 'Server not found' });
      }
    } catch (error) {
      console.error('Error updating server:', error);
      return res.status(500).json({ error: 'Failed to update server' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id || typeof id !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid "id" field' });
    }

    try {
      const wasDeleted = dbManager.deleteMastodonServer(id);
      if (wasDeleted) {
        return res.status(200).json({ message: 'Server deleted successfully' });
      } else {
        return res.status(404).json({ error: 'Server not found' });
      }
    } catch (error) {
      console.error('Error deleting server:', error);
      return res.status(500).json({ error: 'Failed to delete server' });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}