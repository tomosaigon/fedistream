import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getCategoryBySlug } from '@/db/categories';

const fetchTimelineCounts = async (server: string) => {
  const res = await fetch(`/api/timeline?server=${server}&onlyCounts=true`);
  if (!res.ok) throw new Error('Failed to fetch timeline counts');
  return res.json();
};

const fetchTimelinePosts = async ({
  server,
  category,
  offset,
  limit,
  chronological,
}: {
  server: string;
  category: string;
  offset: number;
  limit: number;
  chronological: boolean | undefined;
}) => {
  const res = await fetch(
    `/api/timeline?server=${server}&category=${category}&offset=${offset}&limit=${limit}&chronological=${chronological}`
  );
  if (!res.ok) throw new Error('Failed to fetch timeline posts');
  return res.json();
};

export const useTimeline = ({
  server,
  category,
  chronological,
  postsPerPage = 25,
}: {
  server: string | undefined;
  category: string | undefined;
  chronological: boolean | undefined;
  postsPerPage?: number;
}) => {
  const queryClient = useQueryClient();

  const countsQuery = useQuery({
    queryKey: ['timelineCounts', server],
    queryFn: () => fetchTimelineCounts(server!),
    enabled: !!server, // Fetch only if server is defined
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ['timelinePosts', server, category, chronological],
    queryFn: ({ pageParam = 0 }) =>
      fetchTimelinePosts({
        server: server!,
        category: category!,
        offset: pageParam * postsPerPage,
        limit: postsPerPage,
        chronological: chronological,
      }),
    enabled: !!server && !!category && chronological !== undefined, // Fetch only if both server and category are defined
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page?.buckets[category!] || []).length,
        0
      );
      if (countsQuery === undefined) {
        console.error('countsQuery is undefined');
        return undefined;
      }
      const totalCount = countsQuery.data?.counts[getCategoryBySlug(category!).bucket] || 0;
      return totalFetched < totalCount ? allPages.length : undefined;
    },
    initialPageParam: 0, // Initial offset parameter
  });

  const invalidateTimeline = () => {
    queryClient.invalidateQueries({ queryKey: ['timelineCounts', server] });
    queryClient.invalidateQueries({ queryKey: ['timelinePosts', server, category] });
  };

  return { countsQuery, postsQuery, invalidateTimeline };
};