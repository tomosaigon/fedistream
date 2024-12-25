import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { servers } from '../config/servers';

interface Buckets {
  nonEnglish: number;
  withImages: number;
  asReplies: number;
  networkMentions: number;
  withLinks: number;
  remaining: number;
}

export default function Home() {
  const router = useRouter();
  const [counts, setCounts] = useState<Buckets | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  
  const serverSlug = router.query.server as string || servers[0].slug;
  const currentServer = servers.find(s => s.slug === serverSlug);

  useEffect(() => {
    if (!serverSlug) return;
    
    fetch(`/api/timeline?server=${serverSlug}`)
      .then(res => res.json())
      .then(data => {
        setCounts({
          nonEnglish: data.buckets.nonEnglish.length,
          withImages: data.buckets.withImages.length,
          asReplies: data.buckets.asReplies.length,
          networkMentions: data.buckets.networkMentions.length,
          withLinks: data.buckets.withLinks.length,
          remaining: data.buckets.remaining.length,
        });
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
      const res = await fetch(`/api/timeline?server=${serverSlug}`);
      const data = await res.json();
      setCounts({
        nonEnglish: data.buckets.nonEnglish.length,
        withImages: data.buckets.withImages.length,
        asReplies: data.buckets.asReplies.length,
        networkMentions: data.buckets.networkMentions.length,
        withLinks: data.buckets.withLinks.length,
        remaining: data.buckets.remaining.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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
          <div className="space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loadingOlder}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
} 