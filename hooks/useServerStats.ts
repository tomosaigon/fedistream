import { useQuery, useQueryClient } from '@tanstack/react-query';

const fetchServerStats = async (server: string) => {
  const res = await fetch(`/api/server-stats?server=${server}`);
  if (!res.ok) throw new Error('Failed to fetch server stats');
  return res.json();
};

export const useServerStats = (server: string | undefined) => {
  const queryClient = useQueryClient();

  const invalidateServerStats = () => {
    if (server) {
      queryClient.invalidateQueries({ queryKey: ['serverStats', server] });
    }
  };

  const query = useQuery({
    queryKey: ['serverStats', server],
    queryFn: () => fetchServerStats(server!),
    enabled: !!server, // Only fetch if server is defined
  });

  return { ...query, invalidateServerStats };
};