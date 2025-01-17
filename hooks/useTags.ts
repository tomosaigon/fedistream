import { useCallback } from 'react';

type Tag = {
  tag: string;
  count: number;
};

type UseTagsReturn = {
  handleTag: (reason: string, userId: string, username: string) => Promise<Tag[] | null>;
  handleClearTag: (userId: string, username: string, tag: string) => Promise<Tag[] | null>;
  getAccountTagCount: (tags: Tag[], tag: string) => number;
};

export const useTags = (): UseTagsReturn => {
  // Handles adding a tag to an account
  const handleTag = useCallback(async (reason: string, userId: string, username: string): Promise<Tag[] | null> => {
    try {
      const res = await fetch('/api/tag-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          username,
          tag: reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error tagging account:', error);
      return null;
    }
  }, []);

  // Handles clearing a tag from an account
  const handleClearTag = useCallback(async (userId: string, username: string, tag: string): Promise<Tag[] | null> => {
    try {
      const res = await fetch('/api/tag-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, tag }),
      });

      const data = await res.json();

      if (res.ok) {
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error clearing tag:', error);
      return null;
    }
  }, []);

  // Gets the count for a specific tag on a post
  const getAccountTagCount = useCallback((tags: Tag[], tag: string): number => {
    return tags?.find((t) => t.tag === tag)?.count || 0;
  }, []);

  return { handleTag, handleClearTag, getAccountTagCount };
};
