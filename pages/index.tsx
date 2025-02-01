import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Head from 'next/head';

export default function Home() {
  const [destroying, setDestroying] = useState(false);

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
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      <Head>
        <title>Shadowbox Social</title>
      </Head>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="32"
            height="32"
          >
            <defs>
              <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(0,0,0,0.3)" />
                <stop offset="100%" stop-color="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <ellipse cx="32" cy="48" rx="14" ry="4" fill="rgba(0,0,0,0.2)" />
            <g>
              <polygon points="20,26 32,18 44,26 32,34" fill="#b0e0ff" />
              <polygon points="20,26 32,34 32,42 20,34" fill="#89c9ff" />
              <polygon points="44,26 32,34 32,42 44,34" fill="#60b1ff" />
              <polygon points="20,26 32,34 44,26" fill="#d0f0ff" />
            </g>
          </svg>
          Shadowbox Social
        </h1>
      </div>

      <Dashboard />

      {/* Delete section at bottom */}
      <div className="border-t border-gray-200 mt-8 pt-8">
        <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
        <p className="text-gray-600 text-sm mb-4">
          These actions cannot be undone.
        </p>
        <div className="flex gap-2">
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