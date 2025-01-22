import { DatabaseManager, Reason, ReasonData } from '../../db/database';
import { NextApiRequest, NextApiResponse } from 'next';

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Missing or invalid fields',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

const dbManager = new DatabaseManager();

const validateReasonData = (data: unknown): ReasonData | null => {
  if (!data || typeof data !== 'object' || data === null || typeof (data as ReasonData).reason !== 'string' || (data as ReasonData).active === undefined || (data as ReasonData).filter === undefined) {
    return null;
  }
  return data as ReasonData;
};

const sendResponse = (res: NextApiResponse, status: number, message: string, data?: Reason[]) => {
  res.status(status).json(data ? { message, data } : { message });
};

const handleGet = async (_req: NextApiRequest, res: NextApiResponse) => {
  const reasons: Reason[] = dbManager.getAllReasons();
  sendResponse(res, 200, 'Reasons fetched successfully', reasons);
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const reasonData = validateReasonData(req.body);
  if (!reasonData) {
    return sendResponse(res, 400, ERROR_MESSAGES.MISSING_FIELDS);
  }

  const wasAdded = dbManager.createReason(reasonData);
  if (wasAdded) {
    sendResponse(res, 200, `Reason "${reasonData.reason}" added successfully`);
  } else {
    sendResponse(res, 409, `Reason "${reasonData.reason}" already exists`);
  }
};

const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, ...reasonData } = req.body;
  if (!id || typeof id !== 'number' || !reasonData.reason || reasonData.active === undefined || reasonData.filter === undefined) {
    return sendResponse(res, 400, ERROR_MESSAGES.MISSING_FIELDS);
  }

  const updated = dbManager.updateReasonById(id, reasonData);
  if (updated) {
    sendResponse(res, 200, 'Reason updated successfully');
  } else {
    sendResponse(res, 404, 'Reason not found');
  }
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;
  if (!id || typeof id !== 'number') {
    return sendResponse(res, 400, 'Invalid "id" field');
  }

  const success = dbManager.deleteReasonById(id);
  if (success) {
    sendResponse(res, 200, 'Reason removed successfully');
  } else {
    sendResponse(res, 404, 'Reason not found');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
}