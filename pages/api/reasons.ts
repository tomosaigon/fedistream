import { DatabaseManager } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reasons = dbManager.fetchAllReasons();
      return res.status(200).json({ reasons });
    } catch (error) {
      console.error('Error fetching reasons:', error);
      return res.status(500).json({ error: 'Failed to fetch reasons' });
    }
  }

  if (req.method === 'POST') {
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "reason" field' });
    }

    try {
      const wasAdded = dbManager.addReason(reason);
      if (wasAdded) {
        return res.status(200).json({ message: `Reason "${reason}" added successfully` });
      } else {
        return res.status(409).json({ error: `Reason "${reason}" already exists` });
      }
    } catch (error) {
      console.error('Error adding reason:', error);
      return res.status(500).json({ error: 'Failed to add reason' });
    }
  }

  if (req.method === 'PATCH') {
    const { reason, newReason, active, filter } = req.body;

    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "reason" field' });
    }

    try {
      const updated = dbManager.updateReason(reason, { newReason, active, filter });
      if (updated) {
        return res.status(200).json({ message: 'Reason updated successfully' });
      } else {
        return res.status(404).json({ error: 'Reason not found' });
      }
    } catch (error) {
      console.error('Error updating reason:', error);
      return res.status(500).json({ error: 'Failed to update reason' });
    }
  }

  if (req.method === 'DELETE') {
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "reason" field' });
    }

    try {
      const success = dbManager.deleteReason(reason);
      if (success) {
        return res.status(200).json({ message: 'Reason removed successfully' });
      } else {
        return res.status(404).json({ error: 'Reason not found' });
      }
    } catch (error) {
      console.error('Error deleting reason:', error);
      return res.status(500).json({ error: 'Failed to delete reason' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}