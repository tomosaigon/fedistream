import React from "react";
import { useLocalStorage } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';

interface UseTokenButtonProps {
  serverUrl: string;
  accessToken: string;
}

const UseTokenButton: React.FC<UseTokenButtonProps> = ({ serverUrl, accessToken }) => {
  const [, setServerUrl] = useLocalStorage<string>('serverUrl', '');
  const [, setAccessToken] = useLocalStorage<string>('accessToken', '');

  const handleUseToken = (server_url: string, token: string) => {
    setServerUrl(server_url);
    setAccessToken(token);
    toast.success('Credentials set in localStorage!');
  };

  return (
    <button
      onClick={() => handleUseToken(serverUrl, accessToken)}
      className="mt-2 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
    >
      Use this Token
    </button>
  );
};

export default UseTokenButton;
