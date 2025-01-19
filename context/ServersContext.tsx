import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server } from '@/db/database';

export type { Server } from '@/db/database';

const fetchServers = async (): Promise<Server[]> => {
  const response = await fetch('/api/servers');
  if (!response.ok) {
    throw new Error('Failed to fetch servers');
  }
  const data = await response.json();
  return data.data;
};

interface ServersContextType {
  servers: Server[];
  isLoading: boolean;
  error: unknown;
  getServerBySlug: (slug: string) => Server | undefined;
}

const ServersContext = createContext<ServersContextType | undefined>(undefined);

export const useServers = (): ServersContextType => {
  const context = useContext(ServersContext);
  if (!context) {
    throw new Error('useServers must be used within a ServersProvider');
  }
  return context;
};

interface ServersProviderProps {
  children: ReactNode;
}

export const ServersProvider = ({ children }: ServersProviderProps) => {
  const SERVERS_QUERY_KEY = ['servers'];
  const { data: servers = [], isLoading, error } = useQuery<Server[]>({
    queryKey: SERVERS_QUERY_KEY,
    queryFn: fetchServers,
  });

  const getServerBySlug = (slug: string): Server | undefined =>
    servers.find(server => server.slug === slug);

  return (
    <ServersContext.Provider value={{ servers, isLoading, error, getServerBySlug }}>
      {children}
    </ServersContext.Provider>
  );
};