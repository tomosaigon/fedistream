import { JSX, useState } from "react";

interface AsyncButtonProps {
  callback: () => Promise<void>;
  loadingText?: string;
  defaultText: string | JSX.Element;
  color: 'blue' | 'yellow' | 'amber' | 'red' | 'green' | 'purple';
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
  callback,
  loadingText,
  defaultText,
  color,
}) => {
  const [loading, setLoading] = useState(false);

  const baseClass = `bg-${color}-400`;
  const hoverClass = `hover:bg-${color}-600`;
  const disabledClass = `disabled:bg-gray-400`;

  const handleClick = async () => {
    if (loading) return; // Prevent double-clicks while loading

    setLoading(true);
    try {
      await callback();
    } catch (error) {
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-2 py-2 text-sm text-white rounded flex items-center justify-center ${baseClass} ${hoverClass} ${disabledClass}`}
    >
      {loading && loadingText ? loadingText : defaultText}
    </button>
  );
};

export default AsyncButton;
