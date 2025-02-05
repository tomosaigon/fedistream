import { useEffect, useState } from 'react';
import axios from 'axios';
import { Post } from '../db/database';
import { formatDateTime } from '@/utils/format';
import PostCard from './PostCard';
import PostPoll from './PostPoll';
import MediaAttachment from './MediaAttachment';

interface AccountPostsModalProps {
  accountId: string;
  onClose: () => void;
}

export default function AccountPostsModal({ accountId, onClose }: AccountPostsModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/account-posts?accountId=${accountId}`);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching account posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [accountId]);

  const setActiveImage = () => { };
  const setActivePost = () => { };

  return (
    <div
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}
  >
    {/* <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"> */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full overflow-y-auto max-h-[90vh]">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        <h2 className="text-xl font-semibold mb-4">Posts by Account</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-full">
                <article className="flex-grow min-w-0">
                  <div className="p-4 flex items-start space-x-3">
                    {post.account_url && (
                      <a href={post.account_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        {post.account_avatar && (
                          <img src={post.account_avatar} alt="" className="w-12 h-12 rounded-full hover:opacity-90 transition-opacity" />
                        )}
                      </a>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          {post.account_url ? (
                            <a href={post.account_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              <div className="font-medium text-gray-900">{post.account_display_name}</div>
                              <div className="text-sm text-gray-500">@{post.account_acct || post.account_username}</div>
                            </a>
                          ) : (
                            <>
                              <div className="font-medium text-gray-900">{post.account_display_name}</div>
                              <div className="text-sm text-gray-500">@{post.account_acct || post.account_username}</div>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{formatDateTime(post.created_at)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 sm:px-4 pb-3 text-base sm:text-sm">
                    <div className="prose max-w-none break-words" dangerouslySetInnerHTML={{ __html: post.content }} />
                    {post.card && <PostCard card={post.card} />}
                    {post.poll && <PostPoll poll={post.poll} />}
                    {post.media_attachments.length > 0 && (
                      <MediaAttachment
                        post={post}
                        mediaAttachments={post.media_attachments}
                        setActiveImage={setActiveImage}
                        setActivePost={setActivePost}
                      />
                    )}
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
