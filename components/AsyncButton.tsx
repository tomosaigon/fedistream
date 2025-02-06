import { JSX, useState } from "react";

interface AsyncButtonProps {
  callback: () => Promise<void>;
  loadingText?: string;
  defaultText: string | JSX.Element;
  color: 'blue' | 'yellow' | 'amber' | 'red' | 'green' | 'purple';
  extraClasses?: string;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
  callback,
  loadingText,
  defaultText,
  color,
  extraClasses,
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-2 py-1 text-sm text-white rounded flexxx items-center justify-center ${baseClass} ${hoverClass} ${disabledClass} ${extraClasses}`}
    >
      {loading && loadingText ? loadingText : defaultText}
    </button>
  );
};

export default AsyncButton;
