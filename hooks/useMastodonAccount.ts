import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ServerConfig {
  baseUrl: string;
}

export const useMastodonAccount = (serverConfig?: ServerConfig) => {
  const handleFollowMutation = useMutation({
    mutationFn: async (acct: string) => {
      const token = localStorage.getItem('accessToken');
      const serverUrl = localStorage.getItem('serverUrl');

      if (!token || !serverUrl) {
        toast.error('Access token or server URL is missing');
        throw new Error('Access token or server URL not found');
      }

      // Handle baseUrl adjustment for accounts without @
      if (!acct.includes('@') && serverConfig?.baseUrl !== serverUrl) {
        if (!serverConfig) {
          toast.error('Server config not found');
          throw new Error('Server config not found');
        }

        const url = new URL(serverConfig.baseUrl);
        let serverDomain = url.hostname;

        // Special handling for specific domains
        if (serverDomain === 'mastodon.bsd.cafe') {
          serverDomain = 'bsd.cafe';
        }

        acct = `${acct}@${serverDomain}`;
      }

      const resolveAccountUrl = `${serverUrl}/api/v1/accounts/lookup`;
      const resolveResponse = await axios.get(resolveAccountUrl, {
        params: { acct },
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountId = resolveResponse.data.id;
      if (!accountId) {
        toast.error('Unable to resolve the account to follow');
        throw new Error('Failed to resolve account ID');
      }

      const followApiUrl = `${serverUrl}/api/v1/accounts/${accountId}/follow`;
      await axios.post(followApiUrl, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Successfully followed the user');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to follow the user');
    },
  });

  const handleFavoriteMutation = useMutation({
    mutationFn: async (postUrl: string) => {
      const token = localStorage.getItem('accessToken');
      const serverUrl = localStorage.getItem('serverUrl');

      if (!token || !serverUrl) {
        toast.error('Access token or server URL is missing');
        throw new Error('Access token or server URL not found');
      }

      const searchApiUrl = `${serverUrl}/api/v2/search`;
      const searchResponse = await axios.get(searchApiUrl, {
        params: { q: postUrl, resolve: true },
        headers: { Authorization: `Bearer ${token}` },
      });

      const status = searchResponse.data.statuses?.[0];
      if (!status) {
        toast.error('Post not found on your server.');
        throw new Error('Post not found');
      }

      const postId = status.id;
      const favoriteApiUrl = `${serverUrl}/api/v1/statuses/${postId}/favourite`;
      await axios.post(favoriteApiUrl, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Post favorited successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to favorite the post');
    },
  });

  return {
    handleFollow: handleFollowMutation.mutateAsync,
    handleFavorite: handleFavoriteMutation.mutateAsync,
    isFollowing: handleFollowMutation.isPending,
    isFavoriting: handleFavoriteMutation.isPending,
  };
};