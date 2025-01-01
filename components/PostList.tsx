import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Post, MediaAttachment } from '../db/database';

interface PostListProps {
  posts: Post[];
  onTagUpdate?: () => void;
}

const PostList: React.FC<PostListProps> = ({ posts: initialPosts, onTagUpdate }) => {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleAdminAction = async (action: string, userId: string, username: string, postIndex: number) => {
    try {
      const res = await fetch('/api/tag-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          username,
          tag: action
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.account_id === userId 
              ? { ...post, account_tags: data.tags }
              : post
          )
        );
        onTagUpdate?.(); // Optional full refresh
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error tagging account:', error);
      toast.error('Failed to tag account');
    }
  };

  const getAccountTagCount = (post: Post, tag: string) => {
    return post.account_tags?.find(t => t.tag === tag)?.count || 0;
  };

  const handleClearTag = async (userId: string, username: string, tag: string, postIndex: number) => {
    try {
      const res = await fetch('/api/tag-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, tag })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        // Update local post tags
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.account_id === userId 
              ? { ...post, account_tags: data.tags }
              : post
          )
        );
        onTagUpdate?.(); // Optional full refresh
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error clearing tag:', error);
      toast.error('Failed to clear tag');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        {posts.map((post, index) => {
          // Debug logging
          console.log('Post ID:', post.id);
          console.log('Card data:', post.card);
          const mediaAttachments = (Array.isArray(post.media_attachments) 
            ? post.media_attachments 
            : JSON.parse(post.media_attachments as string)) as MediaAttachment[];

          return (
            <div key={post.id} className="flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-full">

              <article 
                className={`flex-grow min-w-0 ${  // Add min-w-0 to prevent flex child from expanding
                  post.account_tags?.some(t => t.tag === 'cookie')
                    ? 'bg-green-50 border-l-4 border-green-400 hover:bg-green-100' 
                  : post.account_tags?.some(t => t.tag === 'spam')
                    ? 'bg-red-50/5 opacity-10 hover:opacity-25 transition-opacity'  // Extremely light
                  : post.account_tags?.some(t => t.tag === 'bitter')
                    ? `bg-yellow-50 opacity-${Math.max(20, 30 - (post.account_tags.find(t => t.tag === 'bitter')?.count || 0) * 5)} hover:opacity-90`
                  : 'bg-white'
                }`}
              >
                {/* Post Header */}
                <div className={`p-4 flex items-start space-x-3 ${
                  post.account_tags?.some(t => t.tag === 'cookie')
                    ? `border-b border-green-${Math.min(400, 200 + (post.account_tags.find(t => t.tag === 'cookie')?.count || 0) * 50)}`
                  : post.account_tags?.some(t => t.tag === 'spam')
                    ? `border-b border-red-${Math.min(400, 200 + (post.account_tags.find(t => t.tag === 'spam')?.count || 0) * 50)}`
                  : post.account_tags?.some(t => t.tag === 'bitter')
                    ? `border-b border-yellow-${Math.min(400, 200 + (post.account_tags.find(t => t.tag === 'bitter')?.count || 0) * 50)}`
                  : 'border-b border-gray-200'
                }`}>
                  {post.account_url && (
                    <a
                      href={post.account_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      {post.account_avatar && (
                        <img
                          src={post.account_avatar}
                          alt=""
                          className="w-12 h-12 rounded-full hover:opacity-90 transition-opacity"
                        />
                      )}
                    </a>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        {post.account_url ? (
                          <a
                            href={post.account_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            <div className="font-medium text-gray-900">
                              {post.account_display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{post.account_username}
                            </div>
                          </a>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900">
                              {post.account_display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{post.account_username}
                            </div>
                          </>
                        )}
                      </div>
                      {post.url ? (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-500 hover:underline"
                        >
                          {new Date(post.created_at).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </a>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  <div
                    className="prose max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Card */}
                  {post.card && post.card.url && (
                    <a
                      href={post.card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block border rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex">
                        {post.card.image && (
                          <div className="flex-shrink-0 w-48">
                            <img
                              src={post.card.image}
                              alt=""
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 flex-grow">
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {post.card.title || 'No title'}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {post.card.description || 'No description'}
                          </p>
                          {post.card.author_name && (
                            <p className="text-gray-500 text-sm mt-2">
                              By {post.card.author_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Media Attachments */}
                {post.media_attachments.length > 0 && (
                  <div className={`grid gap-2 p-4 ${
                    mediaAttachments.length === 1 ? 'grid-cols-1' :
                    mediaAttachments.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {mediaAttachments.map((media, index) => (
                      media.type === 'video' ? (
                        <div key={index} className="relative pt-[56.25%]">
                          <video 
                            className="absolute inset-0 w-full h-full rounded-lg"
                            controls
                            preload="metadata"
                            poster={media.preview_url}
                          >
                            <source src={media.url} type="video/mp4" />
                            Your browser does not support video playback.
                          </video>
                        </div>
                      ) : media.type === 'image' && media.url && media.preview_url && (
                        <a
                          key={index}
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative pt-[100%] block hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={media.preview_url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          />
                        </a>
                      )
                    ))}
                  </div>
                )}

                {/* Post Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-6 text-gray-500">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">{post.replies_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">{post.reblogs_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{post.favourites_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </div>
              </article>

              {/* Admin section */}
              <div className="w-48 flex-shrink-0 border-l p-4 bg-gray-50 flex flex-col gap-2">
                <div className="text-xs text-gray-500 mb-2">
                  <div>ID: {post.account_id}</div>
                  <div>User: @{post.account_username}</div>
                  {post.account_tags && post.account_tags.length > 0 && (
                    <div className="mt-1">
                      Tags: {post.account_tags.map(tag => tag.tag).join(', ')}
                    </div>
                  )}
                </div>
                {(['spam', 'bitter', 'cookie'] as ('spam' | 'bitter' | 'cookie')[]).map((tag) => {
                  const hasTag = post.account_tags?.some(t => t.tag === tag);
                  const count = getAccountTagCount(post, tag);
                  
                  const colors = {
                    spam: 'red',
                    bitter: 'yellow',
                    cookie: 'green'
                  };

                  return hasTag ? (
                    <div key={tag} className="flex gap-1">
                      <button
                        onClick={() => handleAdminAction(tag, post.account_id, post.account_username, index)}
                        className={`flex-1 px-2 py-1 bg-${colors[tag]}-500 text-white rounded-l hover:bg-${colors[tag]}-600`}
                      >
                        {tag} ({count})
                      </button>
                      <button
                        onClick={() => handleClearTag(post.account_id, post.account_username, tag, index)}
                        className={`px-2 py-1 bg-${colors[tag]}-500 text-white rounded-r hover:bg-${colors[tag]}-600`}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      key={tag}
                      onClick={() => handleAdminAction(tag, post.account_id, post.account_username, index)}
                      className={`w-full px-3 py-1 bg-${colors[tag]}-500 text-white rounded hover:bg-${colors[tag]}-600`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostList;