import { Post } from "./database";

export enum Bucket {
  nonEnglish = 'nonEnglish',
  withImages = 'withImages',
  asReplies = 'asReplies',
  networkMentions = 'networkMentions',
  hashtags = 'hashtags',
  withLinks = 'withLinks',
  fromBots = 'fromBots',
  regular = 'regular',
  reblogs = 'reblogs',
}

export function determineBucket(post: Post): Bucket {
  let mediaAttachments = [];

  try {
    if (typeof post.media_attachments === 'string') {
      mediaAttachments = JSON.parse(post.media_attachments);
    } else if (Array.isArray(post.media_attachments)) {
      mediaAttachments = post.media_attachments;
    }
  } catch (error) {
    console.warn('Failed to parse media_attachments:', error);
    mediaAttachments = [];
  }

  if (post.parent_id) return Bucket.reblogs;
  if (post.account_bot) return Bucket.fromBots;
  if (post.language && post.language !== 'en') return Bucket.nonEnglish; // assume unspecified language is English
  if (mediaAttachments?.length > 0) return Bucket.withImages;
  if (isHashtagPost(post.content)) return Bucket.hashtags;
  if (isNetworkMentionPost(post.content)) return Bucket.networkMentions;
  if (post.content.includes('<a href="')) return Bucket.withLinks;
  if (post.in_reply_to_id) return Bucket.asReplies;
  return Bucket.regular;
}

function isHashtagPost(content: string): boolean {
  // Check for hashtag format
  const links = content.match(/<a[^>]*>.*?<\/a>/g) || [];
  return links.some(link => link.includes('class="mention hashtag"') || link.includes('class="hashtag"'));
}

function isNetworkMentionPost(content: string): boolean {
  // Check for mention format
  const links = content.match(/<a[^>]*>.*?<\/a>/g) || [];
  return links.some(link => link.includes('class="u-url mention"'));
}
