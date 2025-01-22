import { DatabaseManager } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Missing or invalid fields',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

const dbManager = new DatabaseManager();

const sendResponse = (res: NextApiResponse, status: number, message: string, data?: string[]) => {
  res.status(status).json(data ? { message, data } : { message });
};

const handleGet = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const mutedWords: string[] = dbManager.getMutedWords();
    sendResponse(res, 200, 'Muted words fetched successfully', mutedWords);
  } catch (error) {
    console.error('Error fetching muted words:', error);
    sendResponse(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { word } = req.body;
  if (!word || typeof word !== 'string') {
    return sendResponse(res, 400, ERROR_MESSAGES.MISSING_FIELDS);
  }

  try {
    dbManager.createMutedWord(word);
    sendResponse(res, 201, `Muted word "${word}" added successfully`);
  } catch (error) {
    console.error('Error adding muted word:', error);
    sendResponse(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { word } = req.body;
  if (!word || typeof word !== 'string') {
    return sendResponse(res, 400, ERROR_MESSAGES.MISSING_FIELDS);
  }

  try {
    dbManager.deleteMutedWord(word);
    sendResponse(res, 200, `Muted word "${word}" removed successfully`);
  } catch (error) {
    console.error('Error removing muted word:', error);
    sendResponse(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return sendResponse(res, 405, ERROR_MESSAGES.METHOD_NOT_ALLOWED);
    }
  } catch (error) {
    console.error('API error:', error);
    return sendResponse(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}