import React from 'react';
import { Server, useServers } from '@/context/ServersContext';
import { useServerStats } from "@/hooks/useServerStats";
import { useModifyServers } from '@/hooks/useModifyServers';
import AsyncButton from './AsyncButton';
import Link from 'next/link';
import ServerDash from './ServerDash';
import { formatDateTime, calculateTimeDifference } from '@/utils/format';

const Dashboard: React.FC = () => {
  const { servers } = useServers();
  const { data: stats } = useServerStats(undefined, true);
  const { updateServer } = useModifyServers();

  const enabledServers = servers.filter((server) => server.enabled);
  const disabledServers = servers.filter((server) => !server.enabled);

  const enableServer = async (server: Server) => {
    await updateServer({
      id: server.id,
      server: { ...server, enabled: true }, // Only update the `enabled` field
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 bg-gray-100 p-4 text-center border border-gray-300">
          {/* Server counts and configuration link */}
          <p className="text-gray-700">
            Enabled Servers: <span className="font-semibold">{enabledServers.length}</span>
          </p>
          <p className="text-gray-700">
            Disabled Servers: <span className="font-semibold">{disabledServers.length}</span>
          </p>
          <Link
            href="/servers"
            className="w-full text-base text-blue-500 hover:text-blue-600 rounded transition-all duration-200 "
          >
            Configure Servers
          </Link>
        </div>
        <div className="col-span-3 bg-gray-50 p-4 text-center border border-gray-300">

          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-blue-500 text-2xl font-bold">{stats.totalPosts || 0}</span>
                <span className="ml-2 text-gray-600">Total Posts</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-2xl font-bold">{stats.seenPosts || 0}</span>
                <span className="ml-2 text-gray-600">Seen Posts</span>
                <span className="ml-4 text-red-500 text-2xl font-bold">
                  {(stats.totalPosts || 0) - (stats.seenPosts || 0)}
                </span>
                <span className="ml-2 text-gray-600">Unseen Posts</span>
              </div>
              <div className="col-span-2">
                {stats?.oldestPostDate && stats?.latestPostDate ? (
                  <p className="text-gray-500 text-sm">
                    <strong>Posts Collected:</strong> From{" "}
                    <span className="text-blue-500">{formatDateTime(stats.oldestPostDate)}</span> to{" "}
                    <span className="text-blue-500">{formatDateTime(stats.latestPostDate)}</span>
                    {" ("}
                    <span className="text-green-500 font-medium">{calculateTimeDifference(stats.oldestPostDate, stats.latestPostDate)}</span>
                    {")"}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">No posts available to calculate date range.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enabled servers */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Enabled Servers</h2>
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
          {enabledServers.map((server) => (
            <li key={server.id} className="border rounded shadow-sm p-4 bg-white">
              <ServerDash server={server} />
            </li>
          ))}
        </ul>
      </div>

      {/* Disabled servers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Disabled Servers</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {disabledServers.map((server) => (
            <li key={server.id} className="border rounded shadow-sm p-4 bg-gray-50">
              <h3 className="text-md font-semibold text-gray-700 mb-2">{server.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{server.uri}</p>
              <AsyncButton
                callback={() => enableServer(server)}
                defaultText="Enable"
                loadingText="Enabling..."
                color="green"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;