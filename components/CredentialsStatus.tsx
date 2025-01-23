import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CredentialsStatus: React.FC = () => {
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const isConfigured = token && serverUrl;

  useEffect(() => {
    setToken(localStorage.getItem('accessToken')??'');
    setServerUrl(localStorage.getItem('serverUrl')??'');
  }, []);

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded shadow">
      {isConfigured ? (
        <p className="text-green-600">
          A token is set for the server: <strong>{serverUrl}</strong>.
        </p>
      ) : (
        <p className="text-red-600">Credentials are not configured.</p>
      )}
      <Link
        href="/credentials"
        className="w-full mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 text-center block"
      >
        Configure Credentials
      </Link>
    </div>
  );
};

export default CredentialsStatus;