import { useMutation, UseMutationResult } from '@tanstack/react-query';

interface SyncParams {
  older?: boolean;
}

export function useSyncPosts({
  server,
  invalidateTimeline,
  invalidateServerStats,
}: {
  server: string;
  invalidateTimeline: () => void;
  invalidateServerStats: () => void;
}): UseMutationResult<number, Error, SyncParams> {
  return useMutation<number, Error, SyncParams>({
    mutationFn: async ({ older = false }) => {
      const res = await fetch(
        `/api/timeline-sync?server=${server}${older ? '&older=true' : ''}`,
        { method: 'POST' }
      );

      if (!res.ok) {
        throw new Error(`Sync failed: ${res.statusText}`);
      }

      const data = await res.json();
      return data.newPosts; // Assume `data.newPosts` contains the number of posts synced
    },
    onSuccess: (newPosts, { older }) => {
      if (newPosts > 0) {
        if (!older) {
          invalidateTimeline(); // Reload posts for newer posts
        }
        invalidateServerStats(); // Reload server stats
      }
    },
    onError: (error) => {
      console.error('Error syncing posts:', error);
    },
  });
}