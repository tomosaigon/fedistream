import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useServers } from '../context/ServersContext';

const CredentialsStatus: React.FC = () => {
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const isConfigured = token && serverUrl;
  const { servers } = useServers();
  const [slug, setSlug] = useState('...');

  useEffect(() => {
    setToken(localStorage.getItem('accessToken') ?? '');
    setServerUrl(localStorage.getItem('serverUrl') ?? '');
  }, []);

  useEffect(() => {
    servers.find((srv) => srv.uri === serverUrl.replaceAll('"', '') && setSlug(srv.slug));
  }, [servers, serverUrl]);

  return (
    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">
      {isConfigured ? (<>
        <p className="text-gray-700 text-sm">Access token is set for:</p>
        <p className="text-green-600 text-lg font-semibold">{slug}</p>
      </>
      ) : (
        <p className="text-red-600">Credentials are not configured.</p>
      )}
      <Link
        href="/credentials"
        className="inline-block mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-all duration-200"
      >
        Manage Credentials
      </Link>
    </div>
  );
};

export default CredentialsStatus;