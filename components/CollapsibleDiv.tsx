import React, { ReactNode, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface CollapsibleDivProps {
  children: ReactNode;
  title: string; 
}

const CollapsibleDiv: React.FC<CollapsibleDivProps> = ({ children, title }) => {
  const [expanded, setExpanded] = useState(true);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto mb-6 p-6 bg-white shadow-md rounded-md">
    <div className="flex items-center">
      <button onClick={handleToggle} className="">
        {expanded ? (
          <ChevronUpIcon className="h-6 w-6 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-gray-500" />
        )}
      </button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>

      {expanded && (
        <div className="mt-4 p-4 border rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleDiv;
