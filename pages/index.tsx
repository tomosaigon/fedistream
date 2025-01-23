import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useServers } from '@/context/ServersContext';
import toast from 'react-hot-toast';
import Dashboard from '@/components/Dashboard';

interface Counts {
  nonEnglish: number;
  withImages: number;
  asReplies: number;
  networkMentions: number;
  withLinks: number;
  regular: number;
}

export default function Home() {
  const router = useRouter();
  const { servers } = useServers();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingOlder, setSyncingOlder] = useState(false);
  const [syncingNewer, setSyncingNewer] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [destroying, setDestroying] = useState(false);
  
  const serverSlug = router.query.server as string || (servers[0] ? servers[0].slug : '');

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
  }, [servers, serverSlug]);

  const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/?server=${event.target.value}`);
  };

  const handleSyncOlder = async () => {
    setSyncingOlder(true);
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${serverSlug}&older=true`, { 
        method: 'POST' 
      });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Synced ${syncData.newPosts} older posts (${syncData.firstPost.created_at} - ${syncData.lastPost.created_at})`);
      } else {
        toast('No older posts found');
      }

      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load older posts');
    } finally {
      setSyncingOlder(false);
    }
  };

  const handleSyncNewer = async () => {
    setSyncingNewer(true);
    try {
      const syncRes = await fetch(`/api/timeline-sync?server=${serverSlug}`, { 
        method: 'POST' 
      });
      const syncData = await syncRes.json();
      
      if (syncData.newPosts > 0) {
        toast.success(`Synced ${syncData.newPosts} newer posts (${syncData.firstPost.created_at} - ${syncData.lastPost.created_at})`);
      } else {
        toast('No new posts found');
      }

      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
      const data = await res.json();
      setCounts(data.counts);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load newer posts');
    } finally {
      setSyncingNewer(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all posts?')) {
      return;
    }
    
    setDeleting(true);
    try {
      const deleteRes = await fetch(`/api/timeline-sync?server=${serverSlug}&delete=true`, {
        method: 'POST'
      });
      
      if (!deleteRes.ok) {
        throw new Error(`Delete failed: ${deleteRes.statusText}`);
      }
      
      // Only refresh counts after successful deletion
      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
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
      const res = await fetch(`/api/timeline?server=${serverSlug}&onlyCounts=true`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shadowbox Social</h1>
        <Link href="/credentials">Manage Mastodon Credentials</Link>
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

      <Dashboard />

      {/* Server selection and refresh buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleSyncNewer}
          disabled={syncingNewer}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {syncingNewer ? 'Syncing...' : 'Sync Newer'}
        </button>
        <button
          onClick={handleSyncOlder}
          disabled={syncingOlder}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {syncingOlder ? 'Syncing...' : 'Sync Older'}
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
            <p className="mt-2 text-sm text-gray-500">{counts?.regular || 0} posts</p>
          )}
        </Link>
      </div>

      {/* Delete section at bottom */}
      <div className="border-t border-gray-200 mt-8 pt-8">
        <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
        <p className="text-gray-600 text-sm mb-4">
          These actions cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            {deleting ? 'Deleting...' : 'Delete All Posts'}
          </button>
          <button
            onClick={handleDestroy}
            disabled={destroying}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:bg-gray-400"
          >
            {destroying ? 'Destroying...' : 'Destroy Database'}
          </button>
        </div>
      </div>
    </div>
  );
}