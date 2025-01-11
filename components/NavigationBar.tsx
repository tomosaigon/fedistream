import React, { useState } from 'react';
import Link from 'next/link';
import { servers } from '../config/servers';
import { CATEGORY_MAP, getCategoryBySlug } from '../db/categories';

interface NavigationBarProps {
  server: string;
  onServerChange: (newServer: string) => void;

  category: string;

  counts: Record<string, number> | null;

  filterSettings: {
    showSpam: boolean;
    showBitter: boolean;
    showPhlog: boolean;
    highlightThreshold: number | null;
  };
  updateFilterSettings: (newSettings: Partial<NavigationBarProps['filterSettings']>) => void;
  onMarkSeen: () => void;
  onLoadNewer: () => void;
  onLoadNewer5x: () => void;
  onLoadOlder: () => void;
  onDelete: () => void;
  onDestroy: () => void;

  loadingNewer: boolean;
  loadingOlder: boolean;
  deleting: boolean;
  destroying: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  server,
  onServerChange,
  category,
  counts,
  filterSettings,
  updateFilterSettings,
  onMarkSeen,
  onLoadNewer,
  onLoadNewer5x,
  onLoadOlder,
  onDelete,
  onDestroy,
  loadingNewer,
  loadingOlder,
  deleting,
  destroying,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between py-2">
          {/* Server Selector */}
          <select
            value={server}
            onChange={(e) => onServerChange(e.target.value)}
            className="w-64 sm:w-40 px-2 sm:px-3 py-2 text-sm border rounded"
          >
            {servers.map((srv) => (
              <option key={srv.slug} value={srv.slug}>
                {srv.name}
              </option>
            ))}
          </select>

          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={onMarkSeen}
              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Seen
            </button>
            <button
              onClick={onLoadNewer}
              disabled={loadingNewer}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loadingNewer ? 'Loading Newer...' : 'Newer'}
            </button>
            <button
              onClick={onLoadNewer5x}
              disabled={loadingNewer}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loadingNewer ? 'Loading Newer 5x...' : 'Newer×5'}
            </button>
          </div>
            
          {/* Toggle Menu Button */}
          <button
            className="px-2 py-1 text-gray-500 hover:text-gray-700"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6 inline-block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
            <span className="ml-2">Menu /  {getCategoryBySlug(category).label}</span>
          </button>
        </div>

        {/* Dropdown Menu */}
        <div className={`${menuOpen ? 'block' : 'hidden'} w-full mt-2`}>
          <div className="grid grid-cols-2 gap-4 px-4 py-3">
            {/* Left Column: Database Functions */}
            <div>
              <button
                onClick={onMarkSeen}
                className="w-full px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Mark Seen
              </button>
              <button
                onClick={onLoadNewer}
                disabled={loadingNewer}
                className="w-full mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loadingNewer ? 'Loading Newer...' : 'Load Newer'}
              </button>
              <button
                onClick={onLoadNewer5x}
                disabled={loadingNewer}
                className="w-full mt-2 px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
              >
                {loadingNewer ? 'Loading Newer 5x...' : 'Newer 5x'}
              </button>
              <button
                onClick={onLoadOlder}
                disabled={loadingOlder}
                className="w-full mt-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loadingOlder ? 'Loading Older...' : 'Load Older'}
              </button>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="w-full mt-2 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                {deleting ? 'Deleting...' : 'Delete All Posts'}
              </button>
              <button
                onClick={onDestroy}
                disabled={destroying}
                className="w-full mt-2 px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800 disabled:bg-gray-400"
              >
                {destroying ? 'Destroying...' : 'Destroy Database'}
              </button>
              <Link
                href="/muted-words"
                className="w-full mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 text-center block"
              >
                Muted Words
              </Link>
              <Link
                href="/credentials"
                className="w-full mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 text-center block"
              >
                Mastodon API Credentials
              </Link>
            </div>

            {/* Right Column: Categories and Filters */}
            <div>
              {CATEGORY_MAP.map(({ slug, bucket, label }) => (
                <Link
                  key={slug}
                  href={`/${server}/${slug}`}
                  onClick={toggleMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    category === slug
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  <span className="ml-2 text-sm text-gray-500">
                    ({counts?.[bucket] ?? 0})
                  </span>
                </Link>
              ))}
              <div className="px-4 py-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterSettings.showSpam}
                    onChange={() => updateFilterSettings({ showSpam: !filterSettings.showSpam })}
                    className="form-checkbox"
                  />
                  <span>Show Spam</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={filterSettings.showBitter}
                    onChange={() => updateFilterSettings({ showBitter: !filterSettings.showBitter })}
                    className="form-checkbox"
                  />
                  <span>Show Bitter</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={filterSettings.showPhlog}
                    onChange={() => updateFilterSettings({ showPhlog: !filterSettings.showPhlog })}
                    className="form-checkbox"
                  />
                  <span>Show Phlog (Images)</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={filterSettings.highlightThreshold === 5}
                    onChange={() => updateFilterSettings({ highlightThreshold: 5 })}
                    className="form-checkbox"
                  />
                  <span>Highlight 5+ retoot/favs</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={filterSettings.highlightThreshold === 10}
                    onChange={() => updateFilterSettings({ highlightThreshold: 10 })}
                    className="form-checkbox"
                  />
                  <span>Highlight 10+ retoot/favs</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
