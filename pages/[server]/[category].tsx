import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
// import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useServers } from '@/context/ServersContext';
import { useServerStats } from '@/hooks/useServerStats';
import { useTimeline } from '@/hooks/useTimeline';
import { useSyncPosts } from '@/hooks/useSyncPosts';
import PostList from '../../components/PostList';
import AsyncButton from '../../components/AsyncButton';
import Link from 'next/link';
import NavigationBar from '../../components/NavigationBar';
import { CATEGORY_MAP, getCategoryBySlug } from '../../db/categories';
import { Bucket } from '@/db/bucket';

const POSTS_PER_PAGE = 25;
const FILTER_SETTINGS_KEY = 'filterSettings';



export default function CategoryPage() {
  const router = useRouter();
  const { server, category } = router.query;
  const { getServerBySlug } = useServers();
  const { data: serverStats, invalidateServerStats } = useServerStats(server as string);
  const {
    countsQuery: { data: countsData },
    postsQuery: { data: postsData, fetchNextPage, hasNextPage },
    invalidateTimeline,
  } = useTimeline({
    server: server as string,
    category: category as string,
    postsPerPage: POSTS_PER_PAGE,
  });

  const { bucket, label: bucketLabel } = getCategoryBySlug((category ? category : 'regular') as string);
  const posts = postsData?.pages.flatMap((page) => page.buckets[(category ? category : 'regular') as string] || []) || [];
  const totalCount = countsData ? (countsData?.counts as Record<Bucket, number>)[bucket] : -1;

  const handleLoadMore = async () => {
    await fetchNextPage();
  };

  const latestFetchId = useRef(0);

  const [filterSettings, setFilterSettings] = useState({
    showNonStopWords: true,
    highlightThreshold: null as number | null,
    enableForeignBots: false
  });

  // Update filter settings in localStorage and state
  const updateFilterSettings = (newSettings: Partial<typeof filterSettings>) => {
    const updatedSettings = { ...filterSettings, ...newSettings };
    setFilterSettings(updatedSettings);
    localStorage.setItem(FILTER_SETTINGS_KEY, JSON.stringify(updatedSettings));
  };

  // Load filter settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem(FILTER_SETTINGS_KEY);
    if (savedSettings) {
      setFilterSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleServerChange = (newServer: string) => {
    router.push(`/${newServer}/${category}`);
  };

  const { mutateAsync: syncPosts } = useSyncPosts({
    server: server as string,
    invalidateTimeline,
    invalidateServerStats,
  });
  
  const handleSyncNewer = async () => {
    await syncPosts({ older: false, batch: 1 });
  };
  
  const handleSyncOlder = async () => {
    await syncPosts({ older: true, batch: 1 });
  };
  
  const handleSyncNewer5x = async () => {
    await syncPosts({ older: false, batch: 5 });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all posts?')) {
      return;
    }
    
    try {
      const deleteRes = await fetch(`/api/timeline-sync?server=${server}&delete=true`, {
        method: 'POST'
      });
      
      if (!deleteRes.ok) {
        throw new Error(`Delete failed: ${deleteRes.statusText}`);
      }

      invalidateTimeline(); // Reload posts if new content
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert('Failed to delete posts: ' + error.message);
      } else {
        alert('Failed to delete posts: An unknown error occurred.');
      }
    }
  };

  const handleDestroy = async () => {
    if (!confirm('Are you sure you want to destroy the database? This will delete ALL posts from ALL servers.')) {
      return;
    }
    
    try {
      const destroyRes = await fetch(`/api/timeline-sync?delete=true`, {
        method: 'POST'
      });

      if (!destroyRes.ok) {
        throw new Error(`Destroy failed: ${destroyRes.statusText}`);
      }
      
      invalidateTimeline(); // Reload posts if new content
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert('Failed to destroy database: ' + error.message);
      } else {
        alert('Failed to destroy database: An unknown error occurred.');
      }
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleMarkSeen = async () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    if (posts.length === 0) {
      toast.error('No posts to mark as seen');
      return;
    }
  
    const fetchId = ++latestFetchId.current;
    const seenFrom = posts[posts.length - 1].created_at; // Oldest post
    const seenTo = posts[0].created_at; // Latest post
  
    try {
      const res = await fetch(`/api/mark-seen?server=${server}&seenFrom=${seenFrom}&seenTo=${seenTo}&bucket=${bucket}`, {
        method: 'POST',
      });
  
      if (!res.ok) {
        throw new Error(`Mark seen failed: ${res.statusText}`);
      }
  
      const data = await res.json();
      toast.success(`Marked ${data.updatedCount} posts as seen`);
  
      if (fetchId !== latestFetchId.current) return;
  
      invalidateTimeline(); // Reload posts if new content
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark posts as seen');
    }
  };

  function CategoryNavigation({
    currentSlug,
    counts,
    server,
    bucketLabel,
    totalCount,
  }: {
    currentSlug: string;
    counts: Record<string, number>;
    server: string;
    bucketLabel: string;
    totalCount: number;
  }) {
    if (!counts) return null;
    const currentIndex = CATEGORY_MAP.findIndex((cat) => cat.slug === currentSlug);
  
    const prevCategory =
      currentIndex > 0 ? CATEGORY_MAP[currentIndex - 1] : CATEGORY_MAP[CATEGORY_MAP.length - 1];
    const nextCategory =
      currentIndex < CATEGORY_MAP.length - 1 ? CATEGORY_MAP[currentIndex + 1] : CATEGORY_MAP[0];
  
    return (
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          {/* Previous Category Link */}
          <Link
            href={`/${server}/${prevCategory.slug}`}
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {prevCategory.label} ({counts[prevCategory.bucket] || 0})
          </Link>
  
          {/* Home Link */}
          <Link
            href={`/?server=${server}`}
            className="text-blue-500 hover:underline text-center"
          >
            Home
          </Link>
  
          {/* Next Category Link */}
          <Link
            href={`/${server}/${nextCategory.slug}`}
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            {nextCategory.label} ({counts[nextCategory.bucket] || 0})
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
  
        {/* Current Category Heading */}
        <h1 className="text-2xl font-bold mt-2">
          {bucketLabel}
          <span className="text-gray-500 text-xl ml-2">({totalCount} total)</span>
        </h1>
  
        {/* Server Information */}
        <p className="text-gray-600 text-base">
          From {server ? getServerBySlug(server)?.name : 'Unknown server'}
        </p>
      </div>
    );
  }

  // <Head>
  //   <title>{`${bucketLabel} - ${server}`}</title>
  //   <meta name="description" content={`Posts from ${server} in category ${bucketLabel}`} />
  // </Head>
  return (
    <div className="flex flex-col min-h-screen" style={{ "overflowY": "scroll",  height: '100vh' }} ref={scrollContainerRef}>
      <main className="flex-1 w-full">
        <NavigationBar
          server={server as string}
          serverStats={serverStats}
          onServerChange={handleServerChange}
          category={category ? (category as string) : 'regular'}
          counts={countsData?.counts}
          filterSettings={filterSettings}
          updateFilterSettings={updateFilterSettings}
          onMarkSeen={handleMarkSeen}
          onSyncNewer={handleSyncNewer}
          onSyncNewer5x={handleSyncNewer5x}
          onSyncOlder={handleSyncOlder}
          onDelete={handleDelete}
          onDestroy={handleDestroy}
        />
        <div className="p-0 sm:p-8">
          <CategoryNavigation 
            currentSlug={category as string}
            counts={countsData?.counts as Record<string, number>}
            server={server as string}
            bucketLabel={bucketLabel}
            totalCount={totalCount}
          />
          {!postsData ? (
            <div className="p-4">Loading...</div>
          ) : (
            <>
              <PostList
                posts={posts}
                  server={server as string}
                  filterSettings={filterSettings}
              />
                <div className="flex justify-center items-center space-x-4 py-4">
                  <button
                    onClick={handleMarkSeen}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Mark Seen
                  </button>
                  {hasNextPage && (
                    <AsyncButton
                      callback={handleLoadMore}
                      loadingText="Loading..."
                      defaultText={`Load More (${totalCount - posts.length} remaining)`}
                      color="blue"
                    />
                  )}
                </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

