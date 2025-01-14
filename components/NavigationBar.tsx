import React, { useState } from 'react';
import Link from 'next/link';
import { servers } from '../config/servers';
import { CATEGORY_MAP, getCategoryBySlug } from '../db/categories';
import AsyncButton from './AsyncButton';
import BucketIcon from './BucketIcon';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { formatDateTime } from '@/utils/format';

export interface ServerStats {
  totalPosts: number;
  seenPosts: number;
  oldestPostDate: string | null;
  latestPostDate: string | null;
}

interface NavigationBarProps {
  server: string;
  serverStats?: ServerStats | null;
  onServerChange: (newServer: string) => void;

  category: string;

  counts: Record<string, number> | null;

  filterSettings: {
    showSpam: boolean;
    showBitter: boolean;
    showPhlog: boolean;
    showNonStopWords: boolean;
    highlightThreshold: number | null;
  };
  updateFilterSettings: (newSettings: Partial<NavigationBarProps['filterSettings']>) => void;
  onMarkSeen: () => Promise<void>;
  onSyncNewer: () => Promise<void>;
  onSyncNewer5x: () => Promise<void>;
  onSyncOlder: () => Promise<void>;
  onDelete: () => Promise<void>;
  onDestroy: () => Promise<void>;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  server,
  serverStats,
  onServerChange,
  category,
  counts,
  filterSettings,
  updateFilterSettings,
  onMarkSeen,
  onSyncNewer,
  onSyncNewer5x,
  onSyncOlder,
  onDelete,
  onDestroy,
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
            <AsyncButton
              callback={onMarkSeen}
              loadingText="Marking Seen..."
              defaultText="Seen"
              color="yellow"
            />
            <AsyncButton
              callback={onSyncNewer}
              loadingText="Syncing Newer..."
              defaultText="Newer"
              color="blue"
            />
            <AsyncButton
              callback={onSyncNewer5x}
              loadingText="Syncing Newer 5x..."
              defaultText="Newer×5"
              color="purple"
            />
          </div>

          {/* Toggle Menu Button */}
          <button
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            onClick={toggleMenu}
          >
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
            <span className="text-lg">Menu / {getCategoryBySlug(category).label}</span>
          </button>
        </div>

        {/* Dropdown Menu */}
        <div className={`${menuOpen ? 'block' : 'hidden'} w-full mt-2`}>
          <div className="grid grid-cols-2 gap-4 px-4 py-3">
            {/* Left Column: Database Functions */}
            <div className="flex flex-col space-y-2">
              <AsyncButton
                callback={onMarkSeen}
                loadingText="Marking Seen..."
                defaultText="Mark Seen"
                color="yellow"
              />
              <AsyncButton
                callback={onSyncNewer}
                loadingText="Syncing Newer..."
                defaultText="Sync Newer"
                color="blue"
              />
              <AsyncButton
                callback={onSyncNewer5x}
                loadingText="Syncing Newer 5x..."
                defaultText="Sync Newer 5x"
                color="purple"
              />
              <AsyncButton
                callback={onSyncOlder}
                loadingText="Syncing Older..."
                defaultText="Sync Older"
                color="green"
              />
              <AsyncButton
                callback={onDelete}
                loadingText="Deleting..."
                defaultText="Delete All Posts"
                color="red"
              />
              <AsyncButton
                callback={onDestroy}
                loadingText="Destroying..."
                defaultText="Destroy Database"
                color="red"
              />
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

              {/* Server Stats */}
              {serverStats && (
                <div className="mt-4 p-4 border-t border-gray-300 text-sm text-gray-600">
                  <p><strong>Server Stats:</strong></p>
                  <p>Total Posts: {serverStats.totalPosts}</p>
                  <p>Seen Posts: {serverStats.seenPosts}</p>
                  <p>Oldest Post: {serverStats.oldestPostDate ? formatDateTime(serverStats.oldestPostDate) : 'N/A'}</p>
                  <p>Latest Post: {serverStats.latestPostDate ? formatDateTime(serverStats.latestPostDate) : 'N/A'}</p>
                </div>
              )}
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
                  <BucketIcon bucket={bucket} className="w-6 h-6 pb-1 mr-1 inline-block" />
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
                    checked={filterSettings.showNonStopWords}
                    onChange={() => updateFilterSettings({ showNonStopWords: !filterSettings.showNonStopWords })}
                    className="form-checkbox"
                  />
                  <span>Show Non-Stop Words</span>
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
