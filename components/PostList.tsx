import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Post, MediaAttachment } from '../db/database';
import { getNonStopWords, containsMutedWord, getMutedWordsFound } from '../utils/nonStopWords';
import useMutedWords from '../hooks/useMutedWords';
import { ImageModal } from './ImageModal';
import RepliesModal from './RepliesModal';
import axios from 'axios';
import AsyncButton from './AsyncButton';

interface PostListProps {
  posts: Post[];
  filterSettings: {
    showSpam: boolean;
    showBitter: boolean;
    showPhlog: boolean;
    showNonStopWords: boolean;
    highlightThreshold: number | null;
  };
}

const PostList: React.FC<PostListProps> = ({ posts: initialPosts, filterSettings }) => {
  const { mutedWords, addMutedWord } = useMutedWords();
  const [posts, setPosts] = useState(initialPosts);
  const [activeImage, setActiveImage] = useState<MediaAttachment | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeRepliesPost, setActiveRepliesPost] = useState<Post | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleFavorite = async (postUrl: string) => {
    const token = localStorage.getItem('accessToken');
    const serverUrl = localStorage.getItem('serverUrl');
  
    if (!token || !serverUrl) {
      console.error('Access token or server URL not found');
      toast.error('Access token or server URL is missing');
      return;
    }
  
    try {
      // Step 1: Search for the post using its URL on own Mastodon server
      const searchApiUrl = `${serverUrl}/api/v2/search`;
      const searchResponse = await axios.get(searchApiUrl, {
        params: {
          q: postUrl,
          resolve: true, // Resolve remote posts
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Step 2: Extract the post ID from the search results
      const status = searchResponse.data.statuses?.[0];
      if (!status) {
        console.error('Post not found on your server.');
        toast.error('Post not found on your server.');
        return;
      }
  
      const postId = status.id;
  
      // Step 3: Favorite the post on own server
      const favoriteApiUrl = `${serverUrl}/api/v1/statuses/${postId}/favourite`;
      const favoriteResponse = await axios.post(favoriteApiUrl, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('Post favorited successfully', favoriteResponse.data);
      toast.success('Post favorited successfully');
      // TODO: Update local state to reflect the updated favorites count
    } catch (error) {
      console.error('Error favoriting the post:', error);
      toast.error('Failed to favorite the post');
    }
  };
  
  const handleAdminAction = async (action: string, userId: string, username: string) => {
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

  const handleClearTag = async (userId: string, username: string, tag: string) => {
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
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error clearing tag:', error);
      toast.error('Failed to clear tag');
    }
  };

  const handleRepliesClick = (post: Post) => {
    if (post.replies_count > 0) {
      setActiveRepliesPost(post);
    }
  };

  const renderMediaAttachments = (post: Post, mediaAttachments: MediaAttachment[]) => (
    <div className={`grid gap-2 p-3 sm:p-4 ${
      mediaAttachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
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
          <div 
            key={index}
            onClick={() => {
              setActiveImage(media);
              setActivePost(post);
            }}
            className="cursor-zoom-in"
          >
            <img
              src={media.preview_url}
              alt={media.description}
              className={`w-full rounded-lg hover:opacity-90 transition-opacity ${
                mediaAttachments.length === 1 ? 'h-auto' : 'h-40 sm:h-48'
              } object-cover`}
            />
            <span className="text-xs px-1 rounded">
              {media.description}
            </span>
          </div>
        )
      ))}
    </div>
  );

  return (
    <div className="w-full sm:max-w-4xl mx-0 sm:mx-auto p-0">
      <div className="space-y-1 sm:space-y-4">
        {posts.map((post) => {
          if (
            (!filterSettings.showSpam && post.account_tags.some(tag => tag.tag === 'spam')) ||
            (!filterSettings.showBitter && post.account_tags.some(tag => tag.tag === 'bitter')) ||
            (!filterSettings.showPhlog && post.account_tags.some(tag => tag.tag === 'phlog'))
          ) {
            return null;
          }
          
          const nonStopWords = getNonStopWords(post.content);

          let reblogger = null;

          if (post.reblog) {
            reblogger = { ...post };
            post = post.reblog;
          }

          const isMuted = containsMutedWord(nonStopWords, mutedWords);
          if (isMuted) {
            // TODO - Add way to reveal the muted post
            return (
              <div className="muted-disclaimer bg-gray-100 text-center p-2 text-sm text-red-500">
                Contains muted words: {getMutedWordsFound(nonStopWords, mutedWords).join(', ')}
              </div>
            )
          }
          // Debug logging
          // console.log('Post ID:', post.id, '+', (new Date(posts[0].created_at).getTime() - new Date(post.created_at).getTime())/(3600*1000), 'hours');
          // console.log('Content', post.content.substring(0, 80), 'Card title:', post.card?.title);
          // const mediaAttachments = (Array.isArray(post.media_attachments) 
          //   ? post.media_attachments 
          //   : JSON.parse(post.media_attachments as string)) as MediaAttachment[];

          return (
            <div key={post.id} className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-full">

              <article className={`flex-grow min-w-0 ${
                containsMutedWord(nonStopWords, mutedWords) ? 'bg-blue-50 opacity-10 hover:opacity-75'
                : filterSettings.highlightThreshold && post.reblogs_count + post.favourites_count > filterSettings.highlightThreshold
                ? 'bg-pink-100 border-l-4 border-pink-400 hover:bg-green-100'
                : post.account_tags?.some(t => t.tag === 'cookie')
                  ? 'bg-green-50 border-l-4 border-green-400 hover:bg-green-100'
                  : post.account_tags?.some(t => t.tag === 'phlog')
                  ? 'bg-yellow-100 opacity-20 hover:opacity-75'
                  : post.account_tags?.some(t => t.tag === 'spam')
                  ? 'bg-red-50/5 opacity-10 hover:opacity-25 transition-all text-xs sm:text-[0.625rem]'
                : post.account_tags?.some(t => t.tag === 'bitter')
                  ? 'bg-yellow-50 opacity-20 hover:opacity-75 transition-all text-xs sm:text-[0.625rem]'
                : 'bg-white'
              }`}>
                {/* Reblog Header */}
                {reblogger && (
                  <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-500 italic p-4">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>
                      <a
                        href={reblogger.account_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline font-semibold"
                      >
                        {reblogger.account_display_name}
                      </a>{" "}
                      boosted on{" "}
                      <a
                        href={reblogger.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {new Date(reblogger.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(reblogger.created_at).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </a>
                    </span>
                  </div>
                )}
                {/* Post Header */}
                <div className={`p-4 flex items-start space-x-3`}>
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
                              @{post.account_acct ? post.account_acct : post.account_username}
                            </div>
                          </a>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900">
                              {post.account_display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{post.account_acct ? post.account_acct : post.account_username}
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
                <div className={`px-3 sm:px-4 pb-3 ${
                  post.account_tags?.some(t => t.tag === 'spam' || t.tag === 'bitter')
                    ? 'text-xs sm:text-[0.625rem]'
                    : 'text-base sm:text-sm'
                }`}>
                  <div 
                    className="prose max-w-none break-words"
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
                              alt={post.card.description}
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

                  {/* Poll */}
                  {post.poll && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold text-lg mb-2">Poll</h4>
                      <ul className="space-y-2">
                        {(() => {
                          const poll = post.poll!; // Assert `post.poll` is not null here
                          return poll.options.map((option, index) => {
                            const percentage = poll.votes_count
                              ? Math.round((option.votes_count / poll.votes_count) * 100)
                              : 0;
                            return (
                              <li key={index}>
                                <div className="flex justify-between mb-1 text-sm">
                                  <span className="flex items-center gap-1">
                                    <span>{option.title}</span>
                                  </span>
                                  <span className="text-gray-500">{percentage}%</span>
                                </div>
                                <div className="relative w-full h-2 bg-gray-300 rounded-full">
                                  <div
                                    className="absolute h-full bg-blue-500 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </li>
                            );
                          });
                        })()}
                      </ul>
                      <div className="text-gray-500 text-sm mt-3 flex justify-between">
                        <span>{post.poll.voters_count || '0'} people</span>
                        <span>{post.poll.expired ? "Closed" : "Active"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Attachments */}
                {post.media_attachments.length > 0 && renderMediaAttachments(post, post.media_attachments)}

                {/* Post Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-6 text-gray-500">
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => handleRepliesClick(post)}
                  >
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
                    <svg
                      onClick={() => handleFavorite(post.url)}
                      className="w-5 h-5 cursor-pointer hover:text-yellow-500 transition-colors"
                      fill="currentColor"
                      stroke="none"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-sm">{post.favourites_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </div>

                {/* Non-Stop Words Section */}
                {filterSettings.showNonStopWords && (
                  <div className="px-3 sm:px-4 pt-3">
                    <p className="text-gray-600 text-xs sm:text-sm">Non-Stop Words:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {nonStopWords.map((word) => (
                        <button
                          key={word}
                          onClick={() => addMutedWord(word)} // Call the function when clicked
                          className={`px-2 py-1 rounded text-xs sm:text-sm ${
                            word.startsWith('#')
                              ? 'bg-green-500 text-white hover:bg-red-600' // Styling for hashtags
                              : 'bg-blue-500 text-white hover:bg-red-600'  // Styling for regular words
                          }`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* Admin section - full width on mobile, side panel on desktop */}
              <div className="w-full sm:w-48 border-t sm:border-t-0 sm:border-l p-3 sm:p-4 bg-gray-50">
                {containsMutedWord(nonStopWords, mutedWords) && (
                  <p className="text-red-500 text-xs sm:text-sm m-2">
                    Contains muted words: {getMutedWordsFound(nonStopWords, mutedWords).join(', ')}
                  </p>
                )}
                <div className="flex flex-row sm:flex-col gap-1 sm:gap-2">
                  <AsyncButton
                    callback={() => handleFavorite(post.url)}
                    defaultText={<>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span>fav</span>
                    </>
                    }
                    color={'yellow'}
                  />
                  {(['spam', 'bitter', 'cookie', 'phlog'] as const).map((tag) => {
                    const hasTag = post.account_tags?.some(t => t.tag === tag);
                    const count = getAccountTagCount(post, tag);

                    const color = tag === 'spam' ? 'red' :
                      tag === 'bitter' ? 'amber' :
                        tag === 'phlog' ? 'yellow' : 'green';

                    return (
                      <div key={tag} className="flex flex-row sm:flex-col gap-1 sm:gap-2">
                        <AsyncButton
                          callback={() => handleAdminAction(tag, post.account_id, post.account_username)}
                          defaultText={hasTag ? `${tag}(${count})` : tag}
                          color={color}
                        />
                        {hasTag ? (
                          <AsyncButton
                            callback={() => handleClearTag(post.account_id, post.account_username, tag)}
                            loadingText={`Clearing ${tag}...`}
                            defaultText="×"
                            color={color}
                          />
                        ) : null}

                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeImage && activePost && (
        <ImageModal
          media={activeImage}
          post={activePost}
          onClose={() => {
            setActiveImage(null);
            setActivePost(null);
          }}
        />
      )}

      {activeRepliesPost && (
        <RepliesModal
          post={activeRepliesPost}
          onClose={() => {
            setActiveRepliesPost(null);
          }}
        />
      )}
    </div>
  );
};

export default PostList;
