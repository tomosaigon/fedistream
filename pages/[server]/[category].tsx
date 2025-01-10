import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Bucket } from '../../db/bucket';
import PostList from '../../components/PostList';
import { getServerBySlug, servers } from '../../config/servers';
import Link from 'next/link';
import { Toaster, toast, ToastOptions, ToastPosition } from 'react-hot-toast';

const toastOptions: ToastOptions = {
  duration: 2000,
  position: 'bottom-right' as ToastPosition,
  style: {
    cursor: 'pointer'
  },
  // onClick: () => {
  //   console.log('TODO XXX Toast clicked!'); // Debug log
  //   toast.dismiss(); // broken
  // }
};

interface TimelineResponse {
  buckets: Record<string, any[]>;
  counts: Record<string, number>;
}

const POSTS_PER_PAGE = 25;

const ORDERED_CATEGORIES = [
  { key: 'regular', label: 'Regular Posts' },
  { key: 'with-images', label: 'Images' },
  { key: 'replies', label: 'Replies' },
  { key: 'network-mentions', label: 'Mentions' },
  { key: 'hashtags', label: 'Hashtags' },
  { key: 'with-links', label: 'Links' },
  { key: 'from-bots', label: 'Bots' },
  { key: 'non-english', label: 'Non-English' },
] as const;

export default function CategoryPage() {
  const router = useRouter();
  const { server, category } = router.query;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [showSpam, setShowSpam] = useState(true);
  const [showBitter, setShowBitter] = useState(true);
  const [showPhlog, setShowPhlog] = useState(true);
  const [highlightThreshold, setHighlightThreshold] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [databaseMenuOpen, setDatabaseMenuOpen] = useState(false);
  const latestFetchId = useRef(0);

  const toggleCategoryMenu = () => {
    setCategoryMenuOpen(!categoryMenuOpen);
    if (!categoryMenuOpen) {
      setDatabaseMenuOpen(false);
    }
  };

  const toggleDatabaseMenu = () => {
    setDatabaseMenuOpen(!databaseMenuOpen);
    if (!databaseMenuOpen) {
      setCategoryMenuOpen(false);
    }
  };

  const handleCategoryClick = () => {
    setCategoryMenuOpen(false);
  };

  const serverConfig = server ? getServerBySlug(server as string) : servers[0];

  useEffect(() => {
    if (!server || !category) return;
    refreshPosts();
  }, [server, category, showSpam, showBitter, showPhlog]);

  const refreshPosts = async () => {
    const fetchId = ++latestFetchId.current;

    setLoading(true);
    setPosts([]);
    
    try {
      // Get posts with category
      const postsRes = await fetch(`/api/timeline?server=${server}&category=${getCategoryKey(category as string)}&offset=0&limit=${POSTS_PER_PAGE}`);
      const postsData: TimelineResponse = await postsRes.json();
      const categoryPosts = postsData.buckets[getCategoryKey(category as string)] || [];
      
      // Get updated counts
      const countsRes = await fetch(`/api/timeline?server=${server}&onlyCounts=true`);
      const countsData = await countsRes.json();

      if (fetchId !== latestFetchId.current) return;
      
      setTotalCount(countsData.counts[getCategoryKey(category as string)] || 0);
      setHasMore(categoryPosts.length < countsData.counts[getCategoryKey(category as string)]);
      setCounts(countsData.counts);

      setPosts(categoryPosts);
    } catch (err) {
      console.error(err);
    } finally {
      if (fetchId === latestFetchId.current) {
        setLoading(false);
      }
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/timeline?server=${server}&category=${getCategoryKey(category as string)}&offset=${posts.length}&limit=${POSTS_PER_PAGE}`
      );
      const data: TimelineResponse = await res.json();
      const newPosts = data.buckets[getCategoryKey(category as string)] || [];

      setHasMore(posts.length + newPosts.length < totalCount);

      setPosts(prev => [...prev, ...newPosts]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Server change handler
  const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newServer = event.target.value;
    router.push(`/${newServer}/${category}`);
  };

  // Load newer/older handlers
  const handleLoadNewer = async () => {
    const fetchId = ++latestFetchId.current;

    setLoadingNewer(true);
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${server}`, { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Loaded ${syncData.newPosts} newer posts`, toastOptions);
        if (fetchId !== latestFetchId.current) return;
        refreshPosts(); // Reload posts if new content
      } else {
        toast('No new posts found', toastOptions);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load newer posts', toastOptions);
    } finally {
      setLoadingNewer(false);
    }
  };

  const handleLoadNewer5x = async () => {
    const fetchId = ++latestFetchId.current;
  
    setLoadingNewer(true);
    try {
      let totalNewPosts = 0;
  
      for (let i = 0; i < 5; i++) {
        const syncRes = await fetch(`/api/timeline-sync?server=${server}`, { method: 'POST' });
        const syncData = await syncRes.json();
  
        if (syncData.newPosts > 0) {
          totalNewPosts += syncData.newPosts;
          toast.success(`Batch ${i + 1}: Loaded ${syncData.newPosts} newer posts`, toastOptions);
  
          // if (fetchId !== latestFetchId.current) return;
          // refreshPosts();
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
        toast.success(`Loaded a total of ${totalNewPosts} newer posts`, toastOptions);
        if (fetchId !== latestFetchId.current) return;
        refreshPosts();
      } else {
        toast('No new posts found after 5x', toastOptions);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load newer posts in 5x mode', toastOptions);
    } finally {
      setLoadingNewer(false);
    }
  };

  const handleLoadOlder = async () => {
    setLoadingOlder(true);
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${server}&older=true`, { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Loaded ${syncData.newPosts} older posts`, toastOptions);
        // refreshPosts(); // DONT Reload posts automatically
      } else {
        toast('No older posts found', toastOptions);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load older posts', toastOptions);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all posts?')) {
      return;
    }
    
    setDeleting(true);
    try {
      const deleteRes = await fetch(`/api/timeline-sync?server=${server}&delete=true`, {
        method: 'POST'
      });
      
      if (!deleteRes.ok) {
        throw new Error(`Delete failed: ${deleteRes.statusText}`);
      }
      
      // Only refresh counts after successful deletion
      const res = await fetch(`/api/timeline?server=${server}&onlyCounts=true`);
      if (!res.ok) {
        throw new Error(`Failed to fetch counts: ${res.statusText}`);
      }
      
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert('Failed to delete posts: ' + error.message);
      } else {
        alert('Failed to delete posts: An unknown error occurred.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDestroy = async () => {
    if (!confirm('Are you sure you want to destroy the database? This will delete ALL posts from ALL servers.')) {
      return;
    }
    
    setDestroying(true);
    try {
      const destroyRes = await fetch(`/api/timeline-sync?delete=true`, {
        method: 'POST'
      });

      if (!destroyRes.ok) {
        throw new Error(`Destroy failed: ${destroyRes.statusText}`);
      }
      
      // Only refresh counts after successful destruction
      const res = await fetch(`/api/timeline?server=${server}&onlyCounts=true`);
      if (!res.ok) {
        throw new Error(`Failed to fetch counts: ${res.statusText}`);
      }
      
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert('Failed to destroy database: ' + error.message);
      } else {
        alert('Failed to destroy database: An unknown error occurred.');
      }
    } finally {
      setDestroying(false);
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
    const bucket = getCategoryKey(category as string); // Transform category to bucket using getCategoryKey
  
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
  
      // Refresh the page to reflect the updated state
      refreshPosts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark posts as seen', toastOptions);
    }
  };

  if (!serverConfig) {
    return <div className="p-4">Server not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        {/* Fixed navigation bar */}
        <nav className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2">
              {/* Top row with server selector, load buttons, and hamburger */}
              <div className="flex items-center justify-between w-full">
                <select 
                  value={server}
                  onChange={handleServerChange}
                  className="w-32 sm:w-40 px-2 sm:px-3 py-2 text-sm border rounded"
                >
                  {servers.map(server => (
                    <option key={server.slug} value={server.slug}>
                      {server.name}
                    </option>
                  ))}
                </select>

                <div className="hidden sm:flex items-center space-x-2">
                    <button
                      onClick={handleMarkSeen}
                      className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Seen
                    </button>
                    <button
                      onClick={handleLoadNewer}
                      disabled={loadingNewer}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {loadingNewer ? 'Loading Newer...' : 'Newer'}
                    </button>
                    <button
                      onClick={handleLoadNewer5x}
                      disabled={loadingNewer}
                      className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
                    >
                      {loadingNewer ? 'Loading Newer 5x...' : 'Newer×5'}
                    </button>
                </div>

                {/* Database menu button */}
                <button
                  className="px-2 py-1 text-gray-500 hover:text-gray-700"
                  onClick={toggleDatabaseMenu}
                >
                  <svg className="w-6 h-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {databaseMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                  <span className="ml-2">DB</span>
                </button>

                {/* Categories menu button */}
                <button
                  className="px-2 py-1 text-gray-500 hover:text-gray-700"
                  onClick={toggleCategoryMenu}
                >
                  <svg className="w-6 h-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {categoryMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                  <span className="ml-2">Cat: {ORDERED_CATEGORIES.find(c => c.key === category)?.label ?? 'Unknown'}</span>
                </button>
              </div>
            </div>

            {/* Database dropdown menu */}
            <div className={`${databaseMenuOpen ? 'block' : 'hidden'} w-full mt-2`}>
              <div className="px-4 py-3">
                <button
                  onClick={handleMarkSeen}
                  className="w-full px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Mark Seen
                </button>
                <button
                  onClick={handleLoadNewer}
                  disabled={loadingNewer}
                  className="w-full mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loadingNewer ? 'Loading Newer...' : 'Load Newer'}
                </button>
                <button
                  onClick={handleLoadNewer5x}
                  disabled={loadingNewer}
                  className="w-full mt-2 px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
                >
                  {loadingNewer ? 'Loading Newer 5x...' : 'Newer 5x'}
                </button>
                <button
                  onClick={handleLoadOlder}
                  disabled={loadingOlder}
                  className="w-full mt-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loadingOlder ? 'Loading Older...' : 'Load Older'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full mt-2 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                >
                  {deleting ? 'Deleting...' : 'Delete All Posts'}
                </button>
                <button
                  onClick={handleDestroy}
                  disabled={destroying}
                  className="w-full mt-2 px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800 disabled:bg-gray-400"
                >
                  {destroying ? 'Destroying...' : 'Destroy Database'}
                </button>

                {/* Link to Muted Words */}
                <Link
                  href="/muted-words"
                  className="w-full mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 text-center block"
                >
                  Muted Words
                </Link>

                {/* Link to Mastodon API Credentials Manager */}
                <Link
                  href="/credentials"
                  className="w-full mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 text-center block"
                >
                  Mastodon API Credentials
                </Link>
              </div>
            </div>

            {/* categories and filters */}
            <div className={`${categoryMenuOpen ? 'block' : 'hidden'} w-full mt-2`}>
              {ORDERED_CATEGORIES.map(({ key, label }) => (
                <Link
                  key={key}
                  href={`/${server}/${key}`}
                  className={`block px-4 py-3 text-base font-medium transition-colors
                    ${category === key 
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={handleCategoryClick}
                >
                  {label}
                  <span className="ml-2 text-sm text-gray-500">
                    ({counts?.[getCategoryKey(key)] ?? 0})
                  </span>
                </Link>
              ))}

              {/* Checkboxes */}
              <div className="px-4 py-3">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={showSpam} 
                    onChange={() => setShowSpam(!showSpam)} 
                    className="form-checkbox"
                  />
                  <span>Show Spam</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    checked={showBitter} 
                    onChange={() => setShowBitter(!showBitter)} 
                    className="form-checkbox"
                  />
                  <span>Show Bitter</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    checked={showPhlog} 
                    onChange={() => setShowPhlog(!showPhlog)} 
                    className="form-checkbox"
                  />
                  <span>Show Phlog (Images)</span>
                </label>

                {/* Highlights */}
                <label className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    checked={highlightThreshold === 5} 
                    onChange={() => setHighlightThreshold(5)} 
                    className="form-checkbox"
                  />
                  <span>Highlight 5+ retoot/favs</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    checked={highlightThreshold === 10} 
                    onChange={() => setHighlightThreshold(10)} 
                    className="form-checkbox"
                  />
                  <span>Highlight 10+ retoot/favs</span>
                </label>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content area - remove padding on mobile */}
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
                {getCategoryTitle(category as string)} 
                <span className="text-gray-500 text-xl ml-2">
                  ({totalCount} total)
                </span>
              </h1>
              <p className="text-gray-600 text-base">
                From {serverConfig.name}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <>
              <PostList 
                posts={posts} 
                showSpam={showSpam} 
                showBitter={showBitter} 
                showPhlog={category === 'with-images' ? showPhlog : true}
                highlightThreshold={highlightThreshold}
              />
                <div className="flex justify-center items-center space-x-4 py-4">
                  <button
                    onClick={handleMarkSeen}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Mark Seen
                  </button>
                  {hasMore && (
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading...' : `Load More (${totalCount - posts.length} remaining)`}
                    </button>
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

function getCategoryKey(category: string): Bucket {
  const categoryMap: Record<string, Bucket> = {
    'regular': Bucket.regular,
    'with-images': Bucket.withImages,
    'replies': Bucket.asReplies,
    'network-mentions': Bucket.networkMentions,
    'hashtags': Bucket.hashtags,
    'with-links': Bucket.withLinks,
    'from-bots': Bucket.fromBots,
    'non-english': Bucket.nonEnglish,
  };

  return categoryMap[category] || Bucket.regular;
}

function getCategoryTitle(category: string): string {
  switch (category) {
    case 'non-english': return 'Non-English Posts';
    case 'with-images': return 'Posts with Images';
    case 'replies': return 'Reply Posts';
    case 'network-mentions': return 'Network Mentions';
    case 'hashtags': return 'Hashtag Posts';
    case 'with-links': return 'Posts with Links';
    case 'from-bots': return 'Bot Posts';
    case 'regular': return 'Regular Posts';
    default: return 'Posts';
  }
}