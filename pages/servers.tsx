import { useState } from 'react';
import { useServers } from '@/context/ServersContext';
import { useModifyServers } from '@/hooks/useModifyServers';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const ManageServers = () => {
  const { servers, loading, refreshServers } = useServers();
  const { addServer, updateServer, removeServer } = useModifyServers();
  const [newServer, setNewServer] = useState({ uri: '', slug: '', name: '', enabled: true });
  const [editingServerId, setEditingServerId] = useState<number | null>(null);
  const [editedServer, setEditedServer] = useState({ uri: '', slug: '', name: '', enabled: true });

  const handleAdd = async () => {
    const { uri, slug, name, enabled } = newServer;
    if (uri.trim() && slug.trim() && name.trim()) {
      await addServer(uri.trim(), slug.trim(), name.trim(), enabled);
      setNewServer({ uri: '', slug: '', name: '', enabled: true });
      refreshServers();
    }
  };

  const handleEdit = (id: number, server: typeof newServer) => {
    setEditingServerId(id);
    setEditedServer(server);
  };

  const handleUpdate = async () => {
    const { uri, slug, name, enabled } = editedServer;
  
    if (uri.trim() && slug.trim() && name.trim()) {
      await updateServer(editingServerId!, {
        uri: uri.trim(),
        slug: slug.trim(),
        name: name.trim(),
        enabled,
      });
      setEditingServerId(null);
      refreshServers();
    }
  };

  const handleCancelEdit = () => {
    setEditingServerId(null);
  };

  const handleRemove = async (id: number) => {
    await removeServer(id);
    refreshServers();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Manage Mastodon Servers</h1>
      <p className="mb-6 text-gray-700">
        Use this page to manage Mastodon servers, including their base uri, slug, display name, and enabled status.
      </p>

      <div className="flex mb-4">
        <input
          type="text"
          value={newServer.uri}
          onChange={(e) => setNewServer({ ...newServer, uri: e.target.value })}
          placeholder="Base uri"
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          value={newServer.slug}
          onChange={(e) => setNewServer({ ...newServer, slug: e.target.value })}
          placeholder="Slug"
          className="flex-1 px-4 py-2 border"
        />
        <input
          type="text"
          value={newServer.name}
          onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
          placeholder="Display Name"
          className="flex-1 px-4 py-2 border"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading servers...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-md">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Base URI</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Slug</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Display Name</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Enabled</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(({ id, uri, slug, name, enabled }) => (
              <tr key={id} className="hover:bg-gray-50">
                {editingServerId === id ? (
                  <>
                    <td className="px-4 py-2 border-b">
                      <input
                        type="text"
                        value={editedServer.uri}
                        onChange={(e) => setEditedServer({ ...editedServer, uri: e.target.value })}
                        className="w-full px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <input
                        type="text"
                        value={editedServer.slug}
                        onChange={(e) => setEditedServer({ ...editedServer, slug: e.target.value })}
                        className="w-full px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <input
                        type="text"
                        value={editedServer.name}
                        onChange={(e) => setEditedServer({ ...editedServer, name: e.target.value })}
                        className="w-full px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={editedServer.enabled}
                        onChange={() => setEditedServer({ ...editedServer, enabled: !editedServer.enabled })}
                      />
                    </td>
                    <td className="px-4 py-2 border-b text-center space-x-2">
                      <button
                        onClick={handleUpdate}
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 border-b">{uri}</td>
                    <td className="px-4 py-2 border-b">{slug}</td>
                    <td className="px-4 py-2 border-b">{name}</td>
                    <td className="px-4 py-2 border-b text-center">
                      {enabled ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 inline" />
                      )}
                    </td>
                    <td className="px-4 py-2 border-b text-center space-x-2">
                      <button
                        onClick={() => handleEdit(id, { uri, slug, name, enabled })}
                        className="mb-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(id)}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageServers;