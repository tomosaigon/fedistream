import React, { useState } from 'react';
import Link from 'next/link';
import { servers, getServerBySlug } from '../config/servers';
import { CATEGORY_MAP, getCategoryKey, getCategoryLabel } from '../db/categories';
import { ToastOptions, toast } from 'react-hot-toast';

interface NavigationBarProps {
  server: string;
  onServerChange: (newServer: string) => void;

  category: string;

  counts: Record<string, number> | null;

  showSpam: boolean;
  toggleShowSpam: () => void;

  showBitter: boolean;
  toggleShowBitter: () => void;

  showPhlog: boolean;
  toggleShowPhlog: () => void;

  highlightThreshold: number | null;
  setHighlightThreshold: (threshold: number | null) => void;

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

const toastOptions: ToastOptions = {
  duration: 2000,
  position: 'bottom-right',
  style: {
    cursor: 'pointer',
  },
};

const NavigationBar: React.FC<NavigationBarProps> = ({
  server,
  onServerChange,
  category,
  counts,
  showSpam,
  toggleShowSpam,
  showBitter,
  toggleShowBitter,
  showPhlog,
  toggleShowPhlog,
  highlightThreshold,
  setHighlightThreshold,
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
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [databaseMenuOpen, setDatabaseMenuOpen] = useState(false);

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

  return (
    <nav className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2">
          {/* Top row with server selector, load buttons, and hamburger */}
          <div className="flex items-center justify-between w-full">
            {/* Server Selector */}
            <select
              value={server}
              onChange={(e) => onServerChange(e.target.value)}
              className="w-32 sm:w-40 px-2 sm:px-3 py-2 text-sm border rounded"
            >
              {servers.map((srv) => (
                <option key={srv.slug} value={srv.slug}>
                  {srv.name}
                </option>
              ))}
            </select>

            {/* Action Buttons (visible on small screens and above) */}
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

            {/* Database Menu Button */}
            <button
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
              onClick={toggleDatabaseMenu}
            >
              <svg
                className="w-6 h-6 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {databaseMenuOpen ? (
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
              <span className="ml-2">DB</span>
            </button>

            {/* Categories Menu Button */}
            <button
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
              onClick={toggleCategoryMenu}
            >
              <svg
                className="w-6 h-6 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {categoryMenuOpen ? (
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
              <span className="ml-2">Cat: {getCategoryLabel(category)}</span>
            </button>
          </div>
        </div>

        {/* Database Dropdown Menu */}
        <div className={`${databaseMenuOpen ? 'block' : 'hidden'} w-full mt-2`}>
          <div className="px-4 py-3">
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

        {/* Categories and Filters Dropdown Menu */}
        <div className={`${categoryMenuOpen ? 'block' : 'hidden'} w-full mt-2`}>
          {CATEGORY_MAP.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/${server}/${slug}`}
              className={`block px-4 py-3 text-base font-medium transition-colors
                ${category === slug
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              onClick={handleCategoryClick}
            >
              {label}
              <span className="ml-2 text-sm text-gray-500">
                ({counts?.[getCategoryKey(slug)] ?? 0})
              </span>
            </Link>
          ))}

          {/* Checkboxes for Filters */}
          <div className="px-4 py-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSpam}
                onChange={toggleShowSpam}
                className="form-checkbox"
              />
              <span>Show Spam</span>
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={showBitter}
                onChange={toggleShowBitter}
                className="form-checkbox"
              />
              <span>Show Bitter</span>
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={showPhlog}
                onChange={toggleShowPhlog}
                className="form-checkbox"
              />
              <span>Show Phlog (Images)</span>
            </label>

            {/* Highlight Thresholds */}
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={highlightThreshold === 5}
                onChange={() => setHighlightThreshold(highlightThreshold === 5 ? null : 5)}
                className="form-checkbox"
              />
              <span>Highlight 5+ retoot/favs</span>
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={highlightThreshold === 10}
                onChange={() => setHighlightThreshold(highlightThreshold === 10 ? null : 10)}
                className="form-checkbox"
              />
              <span>Highlight 10+ retoot/favs</span>
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;