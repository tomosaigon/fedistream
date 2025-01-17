import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ServerConfig {
  baseUrl: string;
}

export const useMastodonAccount = (serverConfig?: ServerConfig) => {
  const [loading, setLoading] = useState(false);

  const handleFollow = async (acct: string) => {
    const token = localStorage.getItem('accessToken');
    const serverUrl = localStorage.getItem('serverUrl');

    if (!token || !serverUrl) {
      console.error('Access token or server URL not found');
      toast.error('Access token or server URL is missing');
      return;
    }

    if (!acct.includes('@') && serverConfig?.baseUrl !== serverUrl) {
      if (!serverConfig) {
        console.error('Server config not found');
        toast.error('Server config not found');
        return;
      }
      const url = new URL(serverConfig?.baseUrl);
      let serverDomain = url.hostname;

      if (serverDomain === 'mastodon.bsd.cafe') {
        serverDomain = 'bsd.cafe';
      }
      acct = `${acct}@${serverDomain}`;
    }

    try {
      setLoading(true);

      const resolveAccountUrl = `${serverUrl}/api/v1/accounts/lookup`;
      const resolveResponse = await axios.get(resolveAccountUrl, {
        params: { acct },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const accountId = resolveResponse.data.id;

      if (!accountId) {
        console.error('Failed to resolve account ID');
        toast.error('Unable to resolve the account to follow');
        return;
      }

      const followApiUrl = `${serverUrl}/api/v1/accounts/${accountId}/follow`;

      const followResponse = await axios.post(
        followApiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Successfully followed the user', followResponse.data);
      toast.success('Successfully followed the user');
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Access token might be invalid or expired');
        toast.error('Unauthorized: Access token might be invalid or expired');
      } else {
        console.error('Error following the user:', error);
        toast.error('Failed to follow the user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (postUrl: string) => {
    const token = localStorage.getItem('accessToken');
    const serverUrl = localStorage.getItem('serverUrl');

    if (!token || !serverUrl) {
      console.error('Access token or server URL not found');
      toast.error('Access token or server URL is missing');
      return;
    }

    try {
      setLoading(true);

      const searchApiUrl = `${serverUrl}/api/v2/search`;
      const searchResponse = await axios.get(searchApiUrl, {
        params: {
          q: postUrl,
          resolve: true,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const status = searchResponse.data.statuses?.[0];
      if (!status) {
        console.error('Post not found on your server.');
        toast.error('Post not found on your server.');
        return;
      }

      const postId = status.id;
      const favoriteApiUrl = `${serverUrl}/api/v1/statuses/${postId}/favourite`;

      const favoriteResponse = await axios.post(favoriteApiUrl, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Post favorited successfully', favoriteResponse.data);
      toast.success('Post favorited successfully');
    } catch (error) {
      console.error('Error favoriting the post:', error);
      toast.error('Failed to favorite the post');
    } finally {
      setLoading(false);
    }
  };

  return { handleFollow, handleFavorite, loading };
};
