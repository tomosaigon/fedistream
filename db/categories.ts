import { Bucket } from './bucket';

export const CATEGORY_MAP = [
  { slug: 'regular', bucket: Bucket.regular, label: 'Regular Posts' },
  { slug: 'with-images', bucket: Bucket.withImages, label: 'Posts with Images' },
  { slug: 'replies', bucket: Bucket.asReplies, label: 'Reply Posts' },
  { slug: 'network-mentions', bucket: Bucket.networkMentions, label: 'Network Mentions' },
  { slug: 'hashtags', bucket: Bucket.hashtags, label: 'Hashtag Posts' },
  { slug: 'with-links', bucket: Bucket.withLinks, label: 'Posts with Links' },
  { slug: 'from-bots', bucket: Bucket.fromBots, label: 'Bot Posts' },
  { slug: 'non-english', bucket: Bucket.nonEnglish, label: 'Non-English Posts' },
  { slug: 'reblogs', bucket: Bucket.reblogs, label: 'Reblog Posts' },
] as const;

export type Category = typeof CATEGORY_MAP[number];

export function getCategoryBySlug(categorySlug: string): { bucket: Bucket; label: string } {
  const category = CATEGORY_MAP.find(c => c.slug === categorySlug);
  if (!category) {
    throw new Error(`Invalid category slug: ${categorySlug}`);
  }
  return { bucket: category.bucket, label: category.label };
}