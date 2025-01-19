import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useReasons } from '../hooks/useReasons';

const ManageReasons = () => {
  const { reasons, addReason, removeReason, updateReason } = useReasons();
  const [newReason, setNewReason] = useState('');
  const [editingReasonId, setEditingReasonId] = useState<number | null>(null);
  const [editedReason, setEditedReason] = useState('');
  const [editedActive, setEditedActive] = useState(true);
  const [editedFilter, setEditedFilter] = useState(false);

  const handleAdd = async () => {
    if (newReason.trim()) {
      await addReason({
        reason: newReason.trim(),
        active: 1,
        filter: 1,
      });
      setNewReason('');
    }
  };

  const handleRemove = async (id: number) => {
    await removeReason(id);
    // refreshReasons();
  };

  const handleEdit = (id: number, reason: string, active: boolean, filter: boolean) => {
    setEditingReasonId(id);
    setEditedReason(reason)
    setEditedActive(active);
    setEditedFilter(filter);
  };

  const handleUpdate = async () => {
    if (editingReasonId && editedReason.trim()) {
      await updateReason({ id: editingReasonId, data: {
        reason: editedReason.trim(),
        active: editedActive ? 1 : 0,
        filter: editedFilter ? 1 : 0,
      }});
      setEditingReasonId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingReasonId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Manage Reasons</h1>
      <p className="mb-6 text-gray-700">This page allows you to manage reasons for muting or highlighting posts. You can add, edit, or remove reasons and configure their active and filter settings.</p>

      <div className="flex mb-4">
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          placeholder="Enter a reason"
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {!reasons ? (
        <p>Loading reasons...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-md">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Reason</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Added</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Act / Hide</th>
              {/* <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Highlight</th> */}
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reasons.map(({ id, reason, active, filter, created_at }) => (
              <tr key={id} className="hover:bg-gray-50">
                {editingReasonId === id ? (
                  <>
                    <td className="px-4 py-2 border-b">
                      <input
                        type="text"
                        value={editedReason}
                        onChange={(e) => setEditedReason(e.target.value)}
                        className="w-full px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2 border-b text-xs">{created_at.split(' ')[0]}</td>
                    <td className="px-4 py-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={editedActive}
                        onChange={() => setEditedActive(!editedActive)}
                      />
                      <input
                        type="checkbox"
                        checked={editedFilter}
                        onChange={() => setEditedFilter(!editedFilter)}
                      />
                    </td>
                    {/* <td className="px-4 py-2 border-b text-center">-</td> */}
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
                    <td className="px-4 py-2 border-b">{reason}</td>
                    <td className="px-4 py-2 border-b text-xs">{created_at.split(' ')[0]}</td>
                    <td className="px-4 py-2 border-b text-center">
                      {active ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 inline" />
                      )}
                      {filter ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 inline" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 inline" />
                      )}
                    </td>
                    {/* <td className="px-4 py-2 border-b text-center">-</td> */}
                    <td className="px-4 py-2 border-b text-center space-x-2">
                      <button
                        onClick={() => handleEdit(id, reason, active === 1, filter === 1)}
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

export default ManageReasons;

