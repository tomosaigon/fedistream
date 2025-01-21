import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AccountTag } from '@/db/database';

interface TagResponse {
  message: string;
  tags: AccountTag[];
}

type TagPayload = {
  tag: string;
  userId: string;
  username: string;
};

type UseTagsReturn = {
  handleTag: (tag: string, userId: string, username: string) => Promise<AccountTag[] | null>;
  handleClearTag: (userId: string, username: string, tag: string) => Promise<AccountTag[] | null>;
  getAccountTagCount: (tags: AccountTag[], tag: string) => number;
};

export const useTags = (): UseTagsReturn => {
  const queryClient = useQueryClient();
  const TAGS_QUERY_KEY = ['tags'];

  const handleTagMutation = useMutation<TagResponse, Error, TagPayload>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/tag-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.setQueryData(TAGS_QUERY_KEY, data.tags);
    },
    onError: (error) => {
      console.error('Error tagging account:', error);
      toast.error('Failed to tag account.');
    },
  });

  // Mutation for clearing a tag
  const handleClearTagMutation = useMutation<TagResponse, Error, TagPayload>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/tag-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.setQueryData(TAGS_QUERY_KEY, data.tags);
    },
    onError: (error) => {
      console.error('Error clearing tag:', error);
      toast.error('Failed to clear tag.');
    },
  });

  const handleTag = async (tag: string, userId: string, username: string): Promise<AccountTag[] | null> => {
    try {
      const { tags } = await handleTagMutation.mutateAsync({ tag, userId, username });
      return tags;
    } catch {
      return null;
    }
  };

  const handleClearTag = async (userId: string, username: string, tag: string): Promise<AccountTag[] | null> => {
    try {
      const { tags } = await handleClearTagMutation.mutateAsync({ tag, userId, username });
      return tags;
    } catch {
      return null;
    }
  };

  // Utility function
  const getAccountTagCount = (tags: AccountTag[], tag: string): number => {
    return tags?.find((t) => t.tag === tag)?.count || 0;
  };

  return { handleTag, handleClearTag, getAccountTagCount };
};