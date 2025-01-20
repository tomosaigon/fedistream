import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Toaster, toast, ToastOptions, ToastPosition } from 'react-hot-toast';
import { useServers } from '@/context/ServersContext';
import { useServerStats } from '@/hooks/useServerStats';
import { useTimeline } from '@/hooks/useTimeline';
import PostList from '../../components/PostList';
import AsyncButton from '../../components/AsyncButton';
import Link from 'next/link';
import NavigationBar from '../../components/NavigationBar';
import { getCategoryBySlug } from '../../db/categories';


const toastOptions: ToastOptions = {
  duration: 2000,
  position: 'bottom-right' as ToastPosition,
  style: {
    cursor: 'pointer'
  },
};

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

  const posts = postsData?.pages.flatMap((page) => page.buckets[(category ? category : 'regular') as string] || []) || [];
  const totalCount = countsData?.counts[(category ? category : 'regular') as string] || 0;

  const handleLoadMore = async () => {
    await fetchNextPage();
  };

  const latestFetchId = useRef(0);

  const [filterSettings, setFilterSettings] = useState({
    showNonStopWords: true,
    highlightThreshold: null as number | null,
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

  const { bucket, label: bucketLabel } = getCategoryBySlug((category ? category : 'regular') as string);

  const handleServerChange = (newServer: string) => {
    router.push(`/${newServer}/${category}`);
  };

  // Sync newer/older handlers
  const handleSyncNewer = async () => {
    const fetchId = ++latestFetchId.current;

    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${server}`, { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Synced ${syncData.newPosts} newer posts`, toastOptions);
        if (fetchId !== latestFetchId.current) return;
        invalidateTimeline(); // Reload posts if new content
        invalidateServerStats(); // Reload server stats
      } else {
        toast('No new posts found', toastOptions);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load newer posts', toastOptions);
    }
  };

  const handleSyncNewer5x = async () => {
    const fetchId = ++latestFetchId.current;
  
    try {
      let totalNewPosts = 0;
  
      for (let i = 0; i < 5; i++) {
        const syncRes = await fetch(`/api/timeline-sync?server=${server}`, { method: 'POST' });
        const syncData = await syncRes.json();
  
        if (syncData.newPosts > 0) {
          totalNewPosts += syncData.newPosts;
          toast.success(`Batch ${i + 1}: Synced ${syncData.newPosts} newer posts`, toastOptions);
        } else {
          toast(`Batch ${i + 1}: No new posts found`, toastOptions);
          break; // Stop if no new posts in the current batch
        }
  
        // Stop the loop if fewer than the limit were returned
        if (syncData.newPosts < 40) {
          toast(`Stopped after batch ${i + 1} as fewer than 40 posts were returned`, toastOptions);
          break;
        }
      }
  
      if (totalNewPosts > 0) {
        toast.success(`Synced a total of ${totalNewPosts} newer posts`, toastOptions);
        if (fetchId !== latestFetchId.current) return;
        // refreshPosts();
        invalidateTimeline(); // Reload posts if new content
        invalidateServerStats(); // Reload server stats
      } else {
        toast('No new posts found after 5x', toastOptions);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load newer posts in 5x mode', toastOptions);
    }
  };

  const handleSyncOlder = async () => {
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${server}&older=true`, { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Synced ${syncData.newPosts} older posts`, toastOptions);
        invalidateServerStats(); // Reload server stats
        // refreshPosts(); // DONT Reload posts automatically
      } else {
        toast('No older posts found', toastOptions);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load older posts', toastOptions);
    }
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

  const handleMarkSeen = async () => {
    if (posts.length === 0) {
      toast.error('No posts to mark as seen', toastOptions);
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
      toast.success(`Marked ${data.updatedCount} posts as seen`, toastOptions);
  
      if (fetchId !== latestFetchId.current) return;
  
      invalidateTimeline(); // Reload posts if new content
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark posts as seen', toastOptions);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
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
          {/* Back link and title */}
          <div className="p-3 sm:p-4">
            <div>
              <Link 
                href={`/?server=${server}`}
                className="text-blue-500 hover:underline"
              >
                ← Back to Categories
              </Link>
              <h1 className="text-2xl font-bold mt-2">
                {bucketLabel} 
                <span className="text-gray-500 text-xl ml-2">
                  ({totalCount} total)
                </span>
              </h1>
              <p className="text-gray-600 text-base">
                From {server ? getServerBySlug(server as string)?.name : 'Unknown server'}
              </p>
            </div>
          </div>
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
      <Toaster/>
    </div>
  );
}

