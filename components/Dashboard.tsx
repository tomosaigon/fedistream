import React from 'react';
import { Server, useServers } from '@/context/ServersContext';
import { useModifyServers } from '@/hooks/useModifyServers';
import AsyncButton from './AsyncButton';
import Link from 'next/link';
import ServerDash from './ServerDash';

const Dashboard: React.FC = () => {
  const { servers } = useServers();
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

      {/* Server counts and configuration link */}
      <div className="mb-6">
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