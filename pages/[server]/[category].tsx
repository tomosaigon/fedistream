import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BucketedPosts, Post, AccountTag } from '../../db/database';
import PostList from '../../components/PostList';
import { getServerBySlug, servers } from '../../config/servers';
import Link from 'next/link';
import { Toaster, toast, ToastPosition } from 'react-hot-toast';

const toastOptions = {
  duration: 1000,
  // position: 'top-right' as ToastPosition,
  // style: {
  //   cursor: 'pointer'
  // },
  onClick: () => {
    console.log('TODO XXX Toast clicked!'); // Debug log
    toast.dismiss(); // broken
  }
};

interface TimelineResponse {
  buckets: Record<string, any[]>;
  counts: Record<string, number>;
}

const POSTS_PER_PAGE = 25;

// Add constant for ordered categories
const ORDERED_CATEGORIES = [
  { key: 'regular', label: 'Regular Posts' },
  { key: 'with-images', label: 'Images' },
  { key: 'replies', label: 'Replies' },
  { key: 'network-mentions', label: 'Mentions' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSpam, setShowSpam] = useState(true);
  const [showBitter, setShowBitter] = useState(true);

  const serverConfig = server ? getServerBySlug(server as string) : servers[0];
  const offset = posts.length;

  useEffect(() => {
    if (!server || !category) return;
    refreshPosts();
  }, [server, category, showSpam, showBitter]);

  const refreshPosts = async () => {
    setLoading(true);
    setPosts([]); // Reset posts
    
    try {
      // Get posts with category
      const postsRes = await fetch(`/api/timeline?server=${server}&category=${getCategoryKey(category as string)}&offset=0&limit=${POSTS_PER_PAGE}`);
      const postsData: TimelineResponse = await postsRes.json();
      let categoryPosts = postsData.buckets[getCategoryKey(category as string)] || [];
      
      // Filter posts based on checkbox state
      if (!showSpam) {
        categoryPosts = categoryPosts.filter(post => !post.account_tags.some((tag: { tag: string }) => tag.tag === 'spam'));
      }
      if (!showBitter) {
        categoryPosts = categoryPosts.filter((post: Post) => !post.account_tags.some((tag: AccountTag) => tag.tag === 'bitter'));
      }

      // Get updated counts
      const countsRes = await fetch(`/api/timeline?server=${server}&onlyCounts=true`);
      const countsData = await countsRes.json();
      
      setPosts(categoryPosts);
      setTotalCount(countsData.counts[getCategoryKey(category as string)] || 0);
      setHasMore(categoryPosts.length >= POSTS_PER_PAGE && 
        categoryPosts.length < countsData.counts[getCategoryKey(category as string)]);
      setCounts(countsData.counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/timeline?server=${server}&category=${getCategoryKey(category as string)}&offset=${offset}&limit=${POSTS_PER_PAGE}`
      );
      const data: TimelineResponse = await res.json();
      const newPosts = data.buckets[getCategoryKey(category as string)] || [];
      
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(newPosts.length >= POSTS_PER_PAGE && posts.length + newPosts.length < totalCount);
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
    setLoadingNewer(true);
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${server}`, { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Loaded ${syncData.newPosts} newer posts`, toastOptions);
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

  const handleLoadOlder = async () => {
    setLoadingOlder(true);
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${server}&older=true`, { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Loaded ${syncData.newPosts} older posts`, toastOptions);
        refreshPosts(); // Reload posts if new content
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
              <div className="flex items-center justify-between w-full gap-2">
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

                {/* Load buttons - smaller on mobile */}
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={handleLoadNewer}
                    disabled={loadingNewer}
                    className="px-2 sm:px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loadingNewer ? '...' : 'Newer'}
                  </button>
                  <button
                    onClick={handleLoadOlder}
                    disabled={loadingOlder}
                    className="px-2 sm:px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {loadingOlder ? '...' : 'Older'}
                  </button>
                </div>

                {/* Mobile menu button labeled as Categories */}
                <button
                  className="px-2 py-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg className="w-6 h-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                  <span className="ml-2">Categories</span>
                </button>
              </div>
            </div>

            {/* Mobile dropdown menu for categories and filters */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} w-full mt-2`}>
              {ORDERED_CATEGORIES.map(({ key, label }) => (
                <Link
                  key={key}
                  href={`/${server}/${key}`}
                  className={`block px-4 py-3 text-base font-medium transition-colors
                    ${category === key 
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {label}
                  <span className="ml-2 text-sm text-gray-500">
                    ({counts?.[getCategoryKey(key)] ?? 0})
                  </span>
                </Link>
              ))}

              {/* Checkboxes for spam and bitter */}
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
                <span className="text-gray-500 text-lg ml-2">
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
              />
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : `Load More (${totalCount - posts.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

// Update category map for API
function getCategoryKey(category: string): keyof BucketedPosts {
  const categoryMap: Record<string, keyof BucketedPosts> = {
    'regular': 'remaining',
    'with-images': 'withImages',
    'replies': 'asReplies',
    'network-mentions': 'networkMentions',
    'with-links': 'withLinks',
    'from-bots': 'fromBots',
    'non-english': 'nonEnglish'
  };
  return categoryMap[category] || 'remaining';
}

function getCategoryTitle(category: string): string {
  switch (category) {
    case 'non-english': return 'Non-English Posts';
    case 'with-images': return 'Posts with Images';
    case 'replies': return 'Reply Posts';
    case 'network-mentions': return 'Network Mentions';
    case 'with-links': return 'Posts with Links';
    case 'regular': return 'Regular Posts';
    default: return 'Posts';
  }
}