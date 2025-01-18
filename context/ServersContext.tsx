import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export type Server = {
  id: number;
  uri: string;
  slug: string;
  name: string;
  enabled: boolean;
  created_at: string;
};

interface ServersContextType {
  servers: Server[];
  loading: boolean;
  refreshServers: () => Promise<void>;
  getServerBySlug: (slug: string) => Server | undefined;
}

const ServersContext = createContext<ServersContextType | undefined>(undefined);

export const useServers = () => {
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
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshServers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/servers');
      if (!response.ok) {
        throw new Error('Failed to fetch servers');
      }
      const data = await response.json();
      const formattedServers = (data.servers || []).map((server: any) => ({
        ...server,
      }));
      setServers(formattedServers);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServerBySlug = (slug: string): Server | undefined => {
    return servers.find(server => server.slug === slug);
  };

  useEffect(() => {
    refreshServers();
  }, []);

  return (
    <ServersContext.Provider value={{ servers, loading, refreshServers, getServerBySlug }}>
      {children}
    </ServersContext.Provider>
  );
};