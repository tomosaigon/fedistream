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
  questions = 'questions',
  videos = 'videos',
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
  if (post.poll) return Bucket.questions;
  if (isVideoPost(mediaAttachments, post.content)) return Bucket.videos;
  if (mediaAttachments?.length > 0) return Bucket.withImages;
  if (isHashtagPost(post.content)) return Bucket.hashtags;
  if (isNetworkMentionPost(post.content)) return Bucket.networkMentions;
  if (post.content.includes('<a href="')) return Bucket.withLinks;
  if (post.in_reply_to_id) return Bucket.asReplies;
  if (containsQuestion(post.content)) return Bucket.questions;
  return Bucket.regular;
}

function isHashtagPost(content: string): boolean {
  // Check for hashtag format
  const links = content.match(/<a[^>]*>.*?<\/a>/g) || [];
  return links.some(link => link.includes('class="mention hashtag"') || link.includes('class="hashtag"'));
}

function isNetworkMentionPost(content: string): boolean {
  // only apply to cases where the mention is at the beginning of the post.
  const textContent = content.replace(/<[^>]*>/g, ''); // Strip out HTML tags
  return textContent.startsWith('@');
}

function containsQuestion(content: string): boolean {
  // Remove HTML tags and check for a question mark
  const textContent = content.replace(/<[^>]*>/g, ''); // Strip out HTML tags
  return textContent.includes('?');
}

function isVideoPost(mediaAttachments: any[], content: string): boolean {
  // Check media attachments for video types
  const videoMimeTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  const hasVideoAttachment = mediaAttachments.some(attachment => videoMimeTypes.includes(attachment.type));

  if (hasVideoAttachment) return true;

  // Check content for links to popular video platforms
  const videoHosts = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'video.google.com'
  ];

  const links = content.match(/<a[^>]*href="([^"]*)"[^>]*>.*?<\/a>/g) || [];
  return links.some(link => videoHosts.some(host => link.includes(host)));
}
