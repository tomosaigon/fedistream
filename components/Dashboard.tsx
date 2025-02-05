import React from 'react';
import { Server, useServers } from '@/context/ServersContext';
import { useServerStats } from "@/hooks/useServerStats";
import { useModifyServers } from '@/hooks/useModifyServers';
import AsyncButton from './AsyncButton';
import Link from 'next/link';
import CollapsibleDiv from './CollapsibleDiv';
import ServerDash from './ServerDash';
import CredentialsStatus from './CredentialsStatus';
import QuickMutedWords from './QuickMutedWords';
import QuickReasons from './QuickReasons';
import ServerStats from './ServerStats';

const Dashboard: React.FC = () => {
  const { servers } = useServers();
  const { data: stats } = useServerStats(undefined, true);
  const { updateServer } = useModifyServers();

  const enabledServers = servers.filter((server) => server.enabled).sort((a, b) => a.name.localeCompare(b.name));
  const disabledServers = servers.filter((server) => !server.enabled);

  const enableServer = async (server: Server) => {
    await updateServer({
      id: server.id,
      server: { ...server, enabled: true }, // Only update the `enabled` field
    });
  };

  return (
    <div className="sm:p-4">
      {/* <h1 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h1> */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="col-span-2 bg-white p-4 border border-gray-300 shadow-sm">
          {/* Server Status */}
          <div className="text-center mb-4">
            <p className="text-gray-700 text-lg font-medium">
              Servers: <span className="text-green-600 font-semibold">{enabledServers.length}</span>&nbsp;Enabled,
              <span className="text-red-500 font-semibold"> {disabledServers.length}</span>&nbsp;Disabled
            </p>
            <Link
              href="/servers"
              className="inline-block mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-all duration-200"
            >
              Manage Servers
            </Link>
          </div>

          {/* Credentials Status */}
          <CredentialsStatus />
        </div>
        <div className="col-span-3 bg-gray-50  border border-gray-300  p-4 ">
          {stats && (<ServerStats stats={stats} />)}
        </div>
      </div>

      {/* Reasons */}
      <CollapsibleDiv title="Reasons to tag accounts">
        <QuickReasons />
      </CollapsibleDiv>

      {/* Muted Words */}
      <CollapsibleDiv title="Muted Words">
        <QuickMutedWords />
      </CollapsibleDiv>

      {/* Enabled servers */}
      <div className="mb-8">
        {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">Enabled Servers</h2> */}
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
          {enabledServers.map((server) => (
            <li key={server.id} className="border rounded shadow-sm p-4 bg-white">
              <ServerDash server={server} />
            </li>
          ))}
        </ul>
      </div>

      {/* Disabled servers */}
      <CollapsibleDiv title="Disabled Servers">
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
      </CollapsibleDiv>
    </div>
  );
};

export default Dashboard;