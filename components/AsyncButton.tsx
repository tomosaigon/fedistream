import { useState } from "react";

interface AsyncButtonProps {
  callback: () => Promise<void>;
  loadingText: string;
  defaultText: string;
  color: 'blue' | 'yellow' | 'red' | 'green' | 'purple';
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
  callback,
  loadingText,
  defaultText,
  color,
}) => {
  const [loading, setLoading] = useState(false);

  const baseClass = `bg-${color}-500`;
  const hoverClass = `hover:bg-${color}-600`;
  const disabledClass = `disabled:bg-gray-400`;

  const handleClick = async () => {
    if (loading) return; // Prevent double-clicks while loading

    setLoading(true);
    try {
      await callback();
    } catch (error) {
      console.error(error); // Optional: Handle error feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading} // Only disable while loading
      className={`px-4 py-2 text-sm text-white rounded ${baseClass} ${hoverClass} ${disabledClass}`}
    >
      {loading ? loadingText : defaultText}
    </button>
  );
};

export default AsyncButton;
