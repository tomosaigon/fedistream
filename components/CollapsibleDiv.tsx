import React, { ReactNode, useEffect, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface CollapsibleDivProps {
  children: ReactNode;
  title: string;
}

const CollapsibleDiv: React.FC<CollapsibleDivProps> = ({ children, title }) => {
  const [expanded, setExpanded] = useState<boolean>(true); // Default to true

  // Ensure localStorage is only accessed on the client
  useEffect(() => {
    const storedState = localStorage.getItem(title);
    if (storedState !== null) {
      setExpanded(storedState === "true");
    }
  }, [title]);

  const handleToggle = () => {
    setExpanded((prev) => {
      const newState = !prev;
      localStorage.setItem(title, newState.toString());
      return newState;
    });
  };

  return (
    <div className="mx-auto mb-6 p-6 bg-white shadow-md rounded-md">
      <button
        onClick={handleToggle}
        role="button"
        aria-controls="collapsible-content"
        className="flex items-center w-full text-left"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle();
          }
        }}
      >
        {expanded ? (
          <ChevronUpIcon className="h-6 w-6 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-gray-500" />
        )}
        <h1 className="text-2xl font-bold ml-2">{title}</h1>
      </button>
      <div
        id="collapsible-content"
        className={`overflow-hidden transition-[height] duration-300 ease-in-out ${
          expanded ? "h-auto" : "h-0"
        }`}
      >
        {expanded && (
          <div className="mt-4 p-4 border rounded-lg">{children}</div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleDiv;