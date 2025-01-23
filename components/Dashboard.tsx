import React from 'react';
import { useServers } from '@/context/ServersContext';
import ServerStats from './ServerDash';

const Dashboard: React.FC = () => {
  const { servers } = useServers();
  const enabledServers = servers.filter((server) => server.enabled);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <div className="dashboard-grid">
        <ul>
          {enabledServers.map((server) => (
            
            <li key={server.id}>
              <ServerStats server={server} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
