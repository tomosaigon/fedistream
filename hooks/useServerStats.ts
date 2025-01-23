import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bucket } from '@/db/bucket';

export type ServerStatsPayload = {
  totalPosts: number;
  seenPosts: number;
  oldestPostDate: string | null;
  latestPostDate: string | null;
  categoryCounts: Record<Bucket, { seen: number; unseen: number }>;
};

export const fetchServerStats = async (server: string | null) => {
  const url = server ? `/api/server-stats?server=${server}` : `/api/server-stats?all=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch server stats');
  return res.json() as Promise<ServerStatsPayload>;
};

export const useServerStats = (server: string | undefined, all: boolean = false) => {
  const queryClient = useQueryClient();

  const invalidateServerStats = () => {
    queryClient.invalidateQueries({ queryKey: ['serverStats', all ? 'all' : server] });
  };

  const query = useQuery({
    queryKey: ['serverStats', all ? 'all' : server],
    queryFn: () => fetchServerStats(all ? null : server!),
    enabled: all || !!server, // Fetch only if all is true or server is defined
  });

  return { ...query, invalidateServerStats };
};