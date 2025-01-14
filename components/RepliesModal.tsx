import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Post } from '../db/database';
import { getServerBySlug } from '../config/servers';
import toast from 'react-hot-toast';
import { mastodonStatusToPost, MastodonStatus } from '../db/mastodonStatus';


interface RepliesModalProps {
  post: Post;
  onClose: () => void;
}

const RepliesModal: React.FC<RepliesModalProps> = ({ post, onClose }) => {
  const [replies, setReplies] = useState<Post[]>([]);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const serverUrl = getServerBySlug(post.server_slug)?.baseUrl;

        const repliesApiUrl = `${serverUrl}/api/v1/statuses/${post.id}/context`;
        const response = await axios.get(repliesApiUrl);

        setReplies(response.data.descendants.map((reply: MastodonStatus) => mastodonStatusToPost(reply, post.server_slug)));
      } catch (error) {
        console.error('Failed to fetch replies:', error);
        toast.error('Failed to fetch replies');
      }
    };

    fetchReplies();
  }, [post]);

  return (
    <div className="fixed inset-0 z-50  bg-black/50 flex items-center justify-center"
      onClick={(e) => {
        // Check if the click is outside the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
      <div className="relative bg-white w-full max-w-2xl mx-auto p-6 rounded-lg shadow-lg max-h-screen overflow-y-auto">

        {/* Close Button */}
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <button
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* Modal Header */}
        <h2 className="text-xl font-semibold mb-4">Replies</h2>

        {/* Original Post */}
        <div className="p-4 mb-4 border border-gray-300 rounded bg-gray-100">
          <div dangerouslySetInnerHTML={{ __html: post.content }} className="prose max-w-none" />
        </div>

        {/* Replies List */}
        <div className="space-y-4">
          {replies.map((reply) => {
            const isAuthor = reply.account_username === post.account_username;
            return (
              <div
                key={reply.id}
                className={`flex items-start space-x-3 p-4 rounded ${isAuthor
                  ? 'border border-blue-500 bg-blue-50'
                  : 'border border-gray-200 bg-white'
                  }`}
              >
                {/* Avatar */}
                <img
                  src={reply.account_avatar || ''}
                  alt={reply.account_display_name || 'Avatar'}
                  className="w-10 h-10 rounded-full"
                />

                <div className="flex-1 min-w-0">
                  {/* Display Name and Username */}
                  <div className="text-sm flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800">
                        {reply.account_display_name || 'Anonymous'}
                      </span>
                      <span className="text-gray-500 ml-1">
                        @{reply.account_acct || reply.account_username}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(reply.created_at).toLocaleString()}
                    </span>
                  </div>


                  {/* Reply Content */}
                  <div
                    dangerouslySetInnerHTML={{ __html: reply.content }}
                    className="prose max-w-none mt-2 text-gray-700"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* No Replies Message */}
        {replies.length === 0 && (
          <div className="text-center text-gray-500 mt-4">No replies yet.</div>
        )}
      </div>
    </div>
  );
};

export default RepliesModal;
