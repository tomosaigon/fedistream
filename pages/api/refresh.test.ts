import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getServerBySlug } from '../../config/servers';

// Set up in-memory database
process.env.DATABASE_FILE = ':memory:';
import { dbManager } from '../../db';
import handler from './refresh';

// const dbManager = new DatabaseManager();
// let dbManager: DatabaseManager;

// Load mock API response
const mockApiResponse = require('./refresh.test.example.json');
const firstPost = mockApiResponse[0];

// Mock dependencies
jest.mock('../../config/servers');
const mockAxios = new MockAdapter(axios);

describe('Post Database Operations', () => {
  beforeAll(() => {
    // dbManager = new DatabaseManager();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.reset();
    // dbManager.resetDatabase();
    
    (getServerBySlug as jest.Mock).mockReturnValue({
      slug: 'test-server',
      baseUrl: 'https://example.com'
    });

    mockAxios.onGet(/.*\/api\/v1\/timelines\/public.*/).reply(200, mockApiResponse);
  });

  it('should store first post correctly in database', async () => {
    const req = {
      method: 'POST',
      query: { server: 'test-server' }
    } as unknown as NextApiRequest;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;
    const curlatestPost = dbManager.getLatestPost('test-server');
    console.log(curlatestPost);

    await handler(req, res);

    const latestPost = dbManager.getLatestPost('test-server');
    expect(latestPost).toBeDefined();
    expect(latestPost).toMatchObject({
      id: '113700238869579105',
      created_at: '2024-12-23T04:26:01.267Z',
      content: firstPost.content,
      language: 'en',
      in_reply_to_id: null,
      url: 'https://example.com/@iammannyj/113700238869579105',
      account_username: 'iammannyj',
      account_display_name: 'Manny James',
      account_url: 'https://example.com/@iammannyj',
      account_avatar: firstPost.account.avatar,
      media_attachments: '[]',
      visibility: 'public',
      favourites_count: 1,
      reblogs_count: 0,
      replies_count: 0,
      server_slug: 'test-server'
    });
  });

  it('should get latest post after storing multiple posts', async () => {
    const req = {
      method: 'POST',
      query: { server: 'test-server' }
    } as unknown as NextApiRequest;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);
    const latestPost = dbManager.getLatestPost('test-server');
    
    expect(latestPost?.id).toBe('113700238869579105');
    expect(latestPost?.created_at).toBe('2024-12-23T04:26:01.267Z');
  });

  it('should clear posts after database reset', async () => {
    const req = {
      method: 'POST',
      query: { server: 'test-server' }
    } as unknown as NextApiRequest;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);
    dbManager.resetDatabase();
    
    const latestPost = dbManager.getLatestPost('test-server');
    expect(latestPost).toBeUndefined();
  });

  it('should get oldest post when multiple posts exist', async () => {
    const req = {
      method: 'POST',
      query: { server: 'test-server' }
    } as unknown as NextApiRequest;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    const oldestPost = dbManager.getOldestPost('test-server');
    expect(oldestPost).toBeDefined();
    expect(oldestPost).toMatchObject({
      id: mockApiResponse[9].id,
      created_at: mockApiResponse[9].created_at,
      content: mockApiResponse[9].content,
      account_username: mockApiResponse[9].account.username,
      account_display_name: mockApiResponse[9].account.display_name,
      server_slug: 'test-server'
    });
  });
});