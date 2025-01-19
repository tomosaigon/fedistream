import { DatabaseManager } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const dbManager = new DatabaseManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Handle fetching all muted words
        try {
            const mutedWords = dbManager.getMutedWords();
            return res.status(200).json({ mutedWords: Array.from(mutedWords) });
        } catch (error) {
            console.error('Error fetching muted words:', error);
            return res.status(500).json({ error: 'Failed to fetch muted words' });
        }
    }

    if (req.method === 'POST') {
        // Handle adding a new muted word
        const { word } = req.body;

        if (!word || typeof word !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "word" field' });
        }

        try {
            const wasAdded = dbManager.addMutedWord(word);
            if (wasAdded) {
                return res.status(200).json({ message: `Muted word "${word}" added successfully` });
            } else {
                return res.status(409).json({ error: `The word "${word}" is already muted` });
            }
        } catch (error) {
            console.error('Error adding muted word:', error);
            return res.status(500).json({ error: 'Failed to add muted word' });
        }
    }

    if (req.method === 'DELETE') {
        const { word } = req.body;

        if (!word || typeof word !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "word" field' });
        }

        const success = dbManager.removeMutedWord(word);
        if (success) {
            return res.status(200).json({ message: 'Muted word removed successfully' });
        } else {
            return res.status(404).json({ error: 'Muted word not found' });
        }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}