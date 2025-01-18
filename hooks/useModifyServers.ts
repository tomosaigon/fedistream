import { useServers } from '../context/ServersContext';

export const useModifyServers = () => {
  const { refreshServers } = useServers();

  const addServer = async (uri: string, slug: string, name: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri, slug, name, enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to add server');
      }
      await refreshServers();
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  const updateServer = async (
    id: number,
    { uri, slug, name, enabled }: { uri: string; slug: string; name: string; enabled: boolean }
  ) => {
    try {
      const response = await fetch('/api/servers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, uri, slug, name, enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to update server');
      }
      await refreshServers();
    } catch (error) {
      console.error('Error updating server:', error);
    }
  };

  const removeServer = async (id: number) => {
    try {
      const response = await fetch('/api/servers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete server');
      }
      await refreshServers();
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  return { addServer, updateServer, removeServer };
};