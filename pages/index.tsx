import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { servers } from '../config/servers';

interface Counts {
  nonEnglish: number;
  withImages: number;
  asReplies: number;
  networkMentions: number;
  withLinks: number;
  remaining: number;
}

export default function Home() {
  const router = useRouter();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const serverSlug = router.query.server as string || servers[0].slug;
  const currentServer = servers.find(s => s.slug === serverSlug);

  useEffect(() => {
    if (!serverSlug) return;
    
    fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`)
      .then(res => res.json())
      .then(data => {
        setCounts(data.counts);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [serverSlug]);

  const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/?server=${event.target.value}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`/api/refresh?server=${serverSlug}`, { method: 'POST' });
      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadOlder = async () => {
    setLoadingOlder(true);
    try {
      await fetch(`/api/refresh?server=${serverSlug}&older=true`, { 
        method: 'POST' 
      });
      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
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
      await fetch(`/api/refresh?server=${serverSlug}&delete=true`, {
        method: 'POST'
      });
      
      // Refresh counts after deletion 
      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mastodon Timeline Categories</h1>
        <div className="flex items-center space-x-4">
          <select 
            value={serverSlug}
            onChange={handleServerChange}
            className="px-3 py-2 border rounded"
          >
            {servers.map(server => (
              <option key={server.slug} value={server.slug}>
                {server.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Server selection and refresh buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          onClick={handleLoadOlder}
          disabled={loadingOlder}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loadingOlder ? 'Loading...' : 'Load Older'}
        </button>
      </div>

      {/* Main grid content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href={`/${serverSlug}/non-english`} className="p-4 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Non-English Posts</h2>
          <p className="text-gray-600">Posts in languages other than English</p>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{counts?.nonEnglish || 0} posts</p>
          )}
        </Link>
        <Link href={`/${serverSlug}/with-images`} className="p-4 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Posts with Images</h2>
          <p className="text-gray-600">Posts containing image attachments</p>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{counts?.withImages || 0} posts</p>
          )}
        </Link>
        <Link href={`/${serverSlug}/replies`} className="p-4 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Reply Posts</h2>
          <p className="text-gray-600">Posts that are replies to other posts</p>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{counts?.asReplies || 0} posts</p>
          )}
        </Link>
        <Link href={`/${serverSlug}/network-mentions`} className="p-4 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Network Mentions</h2>
          <p className="text-gray-600">Posts with only @mentions and #hashtags</p>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{counts?.networkMentions || 0} posts</p>
          )}
        </Link>
        <Link href={`/${serverSlug}/with-links`} className="p-4 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Posts with Links</h2>
          <p className="text-gray-600">Posts containing external links</p>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{counts?.withLinks || 0} posts</p>
          )}
        </Link>
        <Link href={`/${serverSlug}/regular`} className="p-4 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Regular Posts</h2>
          <p className="text-gray-600">Simple text posts without attachments or links</p>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{counts?.remaining || 0} posts</p>
          )}
        </Link>
      </div>

      {/* Delete section at bottom */}
      <div className="border-t border-gray-200 mt-8 pt-8">
        <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
        <p className="text-gray-600 text-sm mb-4">
          This action cannot be undone. All posts will be permanently deleted.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          {deleting ? 'Deleting...' : 'Delete All Posts'}
        </button>
      </div>
    </div>
  );
}