import { DatabaseManager } from './database';
// import { join } from 'path';
// import fs from 'fs';

// Set the environment variable for the database file to use an in-memory SQLite database
process.env.DATABASE_FILE = ':memory:';

let dbManager: DatabaseManager;

// Mocked Post data
const testPost1 = {
  id: '123',
  created_at: new Date('2023-01-01T00:00:00Z').toISOString(),
  content: 'Hello World!',
  language: 'en',
  in_reply_to_id: null,
  url: 'https://example.com',
  account_id: '1001',
  account_username: 'user123',
  account_display_name: 'User 123',
  account_url: 'https://example.com/user123',
  account_avatar: 'https://example.com/avatar.png',
  media_attachments: JSON.stringify([]),
  visibility: 'public',
  favourites_count: 10,
  reblogs_count: 5,
  replies_count: 3,
  server_slug: 'test-server',
};

const testPost2 = {
  id: '124',
  created_at: new Date('2023-01-02T00:00:00Z').toISOString(),
  content: 'Hello Again!',
  language: 'en',
  in_reply_to_id: null,
  url: 'https://example.com',
  account_id: '1002',
  account_username: 'user124',
  account_display_name: 'User 124',
  account_url: 'https://example.com/user124',
  account_avatar: 'https://example.com/avatar2.png',
  media_attachments: JSON.stringify([{ type: 'image', url: 'https://example.com/image.png' }]),
  visibility: 'public',
  favourites_count: 20,
  reblogs_count: 10,
  replies_count: 5,
  server_slug: 'test-server',
};

const testPost3 = {
  id: '125',
  created_at: new Date('2023-01-03T00:00:00Z').toISOString(),
  content: 'Replying to post',
  language: 'en',
  in_reply_to_id: '123',
  url: 'https://example.com',
  account_id: '1003',
  account_username: 'user125',
  account_display_name: 'User 125',
  account_url: 'https://example.com/user125',
  account_avatar: 'https://example.com/avatar3.png',
  media_attachments: JSON.stringify([]),
  visibility: 'public',
  favourites_count: 30,
  reblogs_count: 15,
  replies_count: 7,
  server_slug: 'test-server',
};

// const testPost4 = {
//   id: '126',
//   created_at: new Date('2023-01-04T00:00:00Z').toISOString(),
//   content: '<a href="https://example.com">@user</a>',
//   language: 'en',
//   in_reply_to_id: null,
//   url: 'https://example.com',
//   account_username: 'user126',
//   account_display_name: 'User 126',
//   account_url: 'https://example.com/user126',
//   account_avatar: 'https://example.com/avatar4.png',
//   media_attachments: JSON.stringify([]),
//   visibility: 'public',
//   favourites_count: 40,
//   reblogs_count: 20,
//   replies_count: 10,
//   server_slug: 'test-server',
// };

const testPost5 = {
  id: '127',
  created_at: new Date('2023-01-05T00:00:00Z').toISOString(),
  content: 'Check this out <a href="https://blog.example.com/protocol/" target="_blank" rel="nofollow noopener noreferrer"><span class="invisible">https://</span><span class="ellipsis">blog.example.com/</span><span class="invisible">ext-protocol/</span></a>',
  language: 'en',
  in_reply_to_id: null,
  url: 'https://example.com',
  account_id: '1005',
  account_username: 'user127',
  account_display_name: 'User 127',
  account_url: 'https://example.com/user127',
  account_avatar: 'https://example.com/avatar5.png',
  media_attachments: JSON.stringify([]),
  visibility: 'public',
  favourites_count: 50,
  reblogs_count: 25,
  replies_count: 12,
  server_slug: 'test-server',
};

const testPost6 = {
  id: '128',
  created_at: new Date('2023-01-06T00:00:00Z').toISOString(),
  content: 'Hola Mundo!',
  language: 'es',
  in_reply_to_id: null,
  url: 'https://example.com',
  account_id: '1006',
  account_username: 'user128',
  account_display_name: 'User 128',
  account_url: 'https://example.com/user128',
  account_avatar: 'https://example.com/avatar6.png',
  media_attachments: JSON.stringify([]),
  visibility: 'public',
  favourites_count: 60,
  reblogs_count: 30,
  replies_count: 15,
  server_slug: 'test-server',
};

const testPost7 = {
  id: '129',
  created_at: new Date('2023-01-07T00:00:00Z').toISOString(),
  content: '<a href="https://fosstodon.org/tags/example" class="mention hashtag" rel="tag">#<span>example</span></a>',
  language: 'en',
  in_reply_to_id: null,
  url: 'https://example.com',
  account_id: '1007',
  account_username: 'user129',
  account_display_name: 'User 129',
  account_url: 'https://example.com/user129',
  account_avatar: 'https://example.com/avatar7.png',
  media_attachments: JSON.stringify([]),
  visibility: 'public',
  favourites_count: 70,
  reblogs_count: 35,
  replies_count: 17,
  server_slug: 'test-server',
};

describe('DatabaseManager Tests', () => {
  beforeAll(() => {
    dbManager = new DatabaseManager();
  });

  afterAll(() => {
    // No need to clean up the in-memory database
  });

  test('Database initializes with schema', () => {
    expect(dbManager.getLatestPost('test-server')).toBeUndefined();
  });

  test('Insert a post into the database and get the latest post', () => {
    dbManager.insertPost(testPost1);
    dbManager.insertPost(testPost2);
    const latestPost = dbManager.getLatestPost('test-server');
    expect(latestPost).toMatchObject({
      id: '124',
      content: 'Hello Again!',
      account_username: 'user124',
    });
  });

  test('Get category counts', () => {
    // dbManager.insertPost(testPost1);
    // dbManager.insertPost(testPost2);
    dbManager.insertPost(testPost3);
    // dbManager.insertPost(testPost4);
    dbManager.insertPost(testPost5);
    dbManager.insertPost(testPost6);
    dbManager.insertPost(testPost7);
    const categoryCounts = dbManager.getCategoryCounts('test-server');
    expect(categoryCounts).toEqual({
      nonEnglish: 1,
      withImages: 1,
      asReplies: 1,
      networkMentions: 1,
      withLinks: 1,
      remaining: 1,
    });
  });

  test('Reset the database and verify getLatestPost fails', () => {
    dbManager.resetDatabase();
    const latestPost = dbManager.getLatestPost('test-server');
    expect(latestPost).toBeUndefined();
  });
});