import { DatabaseManager, Server, ServerData } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Missing or invalid fields',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

const dbManager = new DatabaseManager();

const validateServerData = (data: any): ServerData | null => {
  if (
    !data ||
    typeof data.uri !== 'string' ||
    typeof data.slug !== 'string' ||
    typeof data.name !== 'string' ||
    typeof data.enabled !== 'boolean'
  ) {
    return null;
  }
  return data as ServerData;
};

const sendResponse = (res: NextApiResponse, status: number, message: string, data?: any) => {
  res.status(status).json(data ? { message, data } : { message });
};

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const servers: Server[] = dbManager.getAllServers();
  sendResponse(res, 200, 'Servers fetched successfully', servers);
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const serverData = validateServerData(req.body);
  if (!serverData) {
    return sendResponse(res, 400, ERROR_MESSAGES.MISSING_FIELDS);
  }

  const wasAdded = dbManager.createServer(serverData);
  if (wasAdded) {
    sendResponse(res, 201, `Server "${serverData.name}" added successfully`);
  } else {
    sendResponse(res, 409, `Server "${serverData.name}" already exists`);
  }
};

const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, ...serverData } = req.body;
  if (!id || typeof id !== 'number' || !validateServerData(serverData)) {
    return sendResponse(res, 400, ERROR_MESSAGES.MISSING_FIELDS);
  }

  const wasUpdated = dbManager.updateServer(id, serverData);
  if (wasUpdated) {
    sendResponse(res, 200, `Server "${serverData.name}" updated successfully`);
  } else {
    sendResponse(res, 404, 'Server not found');
  }
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;
  if (!id || typeof id !== 'number') {
    return sendResponse(res, 400, 'Invalid "id" field');
  }

  const wasDeleted = dbManager.deleteServer(id);
  if (wasDeleted) {
    sendResponse(res, 200, 'Server deleted successfully');
  } else {
    sendResponse(res, 404, 'Server not found');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PATCH':
        return handlePatch(req, res);
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