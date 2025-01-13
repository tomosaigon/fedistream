import { Poll, Post } from './database';

export interface MastodonAccount {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  url: string;
  avatar: string;
  bot: boolean;
}

export interface MastodonStatus {
  id: string;
  created_at: string;
  content: string;
  language: string;
  in_reply_to_id: string | null;
  uri: string;
  url: string;
  account: MastodonAccount;
  media_attachments: any[];
  visibility: string;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
  card: any | null;
  poll: Poll | null;
  reblog: MastodonStatus | null;
  was_reblogged: number;
}

export function mastodonStatusToPost(mastodonPost: MastodonStatus, serverSlug: string): Post {
  return {
    ...mastodonPost,
    seen: 0,
    account_id: mastodonPost.account.id,
    account_username: mastodonPost.account.username,
    account_acct: mastodonPost.account.acct,
    account_display_name: mastodonPost.account.display_name,
    account_url: mastodonPost.account.url,
    account_avatar: mastodonPost.account.avatar,
    account_bot: mastodonPost.account.bot,
    server_slug: serverSlug,
    bucket: '',
    account_tags: [],
    poll: mastodonPost.poll ? mastodonPost.poll : null,
    parent_id: mastodonPost.reblog ? mastodonPost.reblog.id : null,
    reblog: mastodonPost.reblog ? mastodonStatusToPost(mastodonPost.reblog, serverSlug) : null,
  };
}