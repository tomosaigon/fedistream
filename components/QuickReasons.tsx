import React from 'react';
import { useReasons } from '../hooks/useReasons';
import Link from 'next/link';

const QuickReasons: React.FC = () => {
  const { reasons, updateReason } = useReasons();

  const handleDisable = async (id: number, reason: string, filter: number) => {
    await updateReason({
      id,
      data: {
        reason,
        active: 0, // Disable the reason
        filter: filter ? 1 : 0, // Preserve the existing filter value
      },
    });
  };

  return !reasons ? (
    <p>Loading reasons...</p>
  ) : (
    <div className="flex flex-wrap gap-4">
      {reasons.map(({ id, reason, active, filter }) => (
        <div
          key={id}
          className={`px-4 py-2 rounded-md shadow-md flex items-center space-x-2 ${active ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'
            }`}
        >
          <span className="text-sm font-medium text-gray-800">{reason}</span>
          {active ? (
            <button
              onClick={() => handleDisable(id, reason, filter)}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disable
            </button>
          ) : (
            <span className="text-xs text-gray-500 italic">Disabled</span>
          )}
        </div>
      ))}

      <Link
        href="/reasons"
        className="w-full text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 text-center block"
      >
        Manage Reasons
      </Link>
    </div>
  );
};

export default QuickReasons;