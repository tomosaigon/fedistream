import {
  ChatBubbleOvalLeftEllipsisIcon,
  ArrowsRightLeftIcon,
  StarIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/solid';
import React, { useState, useEffect } from 'react';
import { Post, IMediaAttachment, AccountTag } from '../db/database';
import { getNonStopWords, containsMutedWord, getMutedWordsFound } from '../utils/nonStopWords';
import { useServers } from '../context/ServersContext';
import { useMutedWords } from '../hooks/useMutedWords';
import { useMastodonAccount } from '../hooks/useMastodonAccount';  
import { useReasons } from '../hooks/useReasons';
import { useTags } from '../hooks/useTags';
import { ImageModal } from './ImageModal';
import MediaAttachment from './MediaAttachment';
import PostCard from './PostCard';
import PostPoll from "./PostPoll";
import RepliesModal from './RepliesModal';
import AsyncButton from './AsyncButton';

import { formatDateTime } from '@/utils/format';

interface PostListProps {
  posts: Post[];
  server: string;
  filterSettings: {
    showNonStopWords: boolean;
    highlightThreshold: number | null;
  };
}

const PostList: React.FC<PostListProps> = ({ posts: initialPosts, server, filterSettings }) => {
  const { reasons } = useReasons();
  const { mutedWords, createMutedWord } = useMutedWords();
  const { handleTag, handleClearTag, getAccountTagCount } = useTags();
  const [posts, setPosts] = useState(initialPosts);
  const [activeImage, setActiveImage] = useState<IMediaAttachment | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeRepliesPost, setActiveRepliesPost] = useState<Post | null>(null);
  const { getServerBySlug} = useServers();
  const { handleFollow, handleFavorite, hasApiCredentials } = useMastodonAccount({ baseUrl: getServerBySlug(server)?.uri??'' }); // XXX

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const updateAccountTags = (
    userId: string,
    tags: AccountTag[]
  ) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.account_id === userId
          ? { ...post, account_tags: tags }
          : post
      )
    );
  }

  return (
    <div className="w-full sm:max-w-4xl mx-0 sm:mx-auto p-0">
      <div className="space-y-1 sm:space-y-4">
        {posts.map((post) => {
          // console.log('Post:', post.account_tags);
          const matchingReason = reasons.find(
            (reason) =>
              reason.filter === 1 &&
              post.account_tags.some((tag) => tag.tag === reason.reason)
          );

          let reblogger = null;
          if (post.reblog) {
            reblogger = { ...post };
            post = post.reblog;
          }

          const nonStopWords = getNonStopWords(post.content);
          const isMuted = containsMutedWord(nonStopWords, mutedWords);
          // TODO - Add way to reveal the muted post

          return (
            <div key={post.id} className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-full">

              <article className={`flex-grow min-w-0 ${
                // containsMutedWord(nonStopWords, mutedWords) ? 'bg-blue-50 opacity-10 hover:opacity-75'
                false ? 'XXX'
                : filterSettings.highlightThreshold && post.reblogs_count + post.favourites_count > filterSettings.highlightThreshold
                ? 'bg-pink-100 border-l-4 border-pink-400 hover:bg-green-100'
                : post.account_tags?.some(t => t.tag === 'cookie')
                  ? 'bg-green-50 border-l-4 border-green-400 hover:bg-green-100'
                  : post.account_tags?.some(t => t.tag === 'phlog') // TODO color programmatically
                  ? 'bg-yellow-100 opacity-20 hover:opacity-75'
                  : post.account_tags?.some(t => t.tag === 'spam')
                  ? 'bg-red-50/5 opacity-10 hover:opacity-25 transition-all text-xs sm:text-[0.625rem]'
                // : post.account_tags?.some(t => t.tag === 'bitter')
                //   ? 'bg-yellow-50 opacity-20 hover:opacity-75 transition-all text-xs sm:text-[0.625rem]'
                : 'bg-white'
              }`}>
                {/* Reblog Header */}
                {reblogger && (
                  <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-500 italic p-4">
                    <ArrowPathIcon className="w-5 h-5 text-gray-400" />
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
                      >{formatDateTime(reblogger.created_at)}</a>
                    </span>
                  </div>
                )}
                {/* Reply Link */}
                {post.in_reply_to_id && (
                  <div className="flex items-center text-sm sm:text-base text-gray-500 px-4 pt-2">
                  <button
                    onClick={() => setActiveRepliesPost(post)}
                    className="flex items-center space-x-2 text-blue-500 hover:underline focus:outline-none"
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5 text-gray-400" />
                    <span>View thread</span>
                  </button>
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
                        >{formatDateTime(post.created_at)}</a>
                      ) : (
                        <div className="text-sm text-gray-500">{formatDateTime(post.created_at)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {matchingReason ? (
                  <div className="mt-2 px-3 sm:px-4 pb-3 text-base sm:text-sm text-red-600">
                    Filtered with reason:{" "}
                    <span className="font-semibold">{matchingReason.reason}</span>
                  </div>
                ) : isMuted ? (
                  <div key={post.id} className="muted-disclaimer bg-gray-100 text-center p-2 text-sm text-red-500">
                    Contains muted words: {getMutedWordsFound(nonStopWords, mutedWords).join(', ')}
                  </div>
                ) : (
                  <div className={`px-3 sm:px-4 pb-3 ${
                    // {/* Post Content */}
                    // post.account_tags?.some(t => t.tag === 'spam' || t.tag === 'bitter')
                    //   ? 'text-xs sm:text-[0.625rem]'
                    //   : 'text-base sm:text-sm'
                    'text-base sm:text-sm'
                    }`}>
                    <div
                      className="prose max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

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
                )}

                {/* Post Footer */}
                {matchingReason || isMuted ? null : (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-6 text-gray-500">
                    <div
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setActiveRepliesPost(post)}
                    >
                      <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                      <span className="text-sm">{post.replies_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowsRightLeftIcon className="w-5 h-5" />
                      <span className="text-sm">{post.reblogs_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarIcon
                        onClick={() => handleFavorite(post.url)}
                        className="w-5 h-5 cursor-pointer hover:text-yellow-500 transition-colors"
                      />
                      <span className="text-sm">{post.favourites_count || 0}</span>
                    </div>
                  </div>
                )}

                {/* Non-Stop Words Section */}
                {filterSettings.showNonStopWords && (
                  <div className="px-3 sm:px-4 pt-3">
                    <p className="text-gray-600 text-xs sm:text-sm">Non-Stop Words:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {nonStopWords.map((word) => (
                        <button
                          key={word}
                          onClick={() => createMutedWord(word)} // Call the function when clicked
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
              <div className="w-full flex items-start space-x-4 border-t sm:border-t-0 sm:border-l p-2 bg-gray-50">
                <div className="flex gap-1 sm:gap-2 max-h-32 sm:max-h-64 relative">
                  {hasApiCredentials ? (
                    <>
                      <AsyncButton
                        callback={() => handleFavorite(post.url)}
                        defaultText={
                          <>
                            <StarIcon
                              className="w-4 h-4 cursor-pointer hover:text-yellow-500 transition-colors"
                            />
                            <span>fav</span>
                          </>
                        }
                        color={'yellow'}
                      />
                      <AsyncButton
                        callback={() => handleFollow(post.account_acct)}
                        defaultText={
                          <>
                            <UserPlusIcon className="w-4 h-4 cursor-pointer hover:text-green-500 transition-colors" />
                            <span>Follow</span>
                          </>
                        }
                        color={'green'}
                      />
                    </>
                  ) : (
                    <div className="relative group flex space-x-1">
                      {/* Favorite Button with Tooltip */}
                      <StarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">fav</span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg">
                          You need to configure API credentials
                        </div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>

                      {/* Follow Button with Tooltip */}
                      <UserPlusIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">Follow</span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg">
                          You need to configure API credentials
                        </div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </div>
                  )}
                  </div>
                  <div className="flex flex-row gap-1 sm:gap-2 max-h-32 sm:max-h-64 overflow-y-auto relative">

                  {reasons.filter(reason => reason.active === 1).map(({ reason: tag, filter }) => {
                    const hasTag = post.account_tags?.some(t => t.tag === tag);
                    const count = getAccountTagCount(post.account_tags, tag);
                    const color = filter === 1 ? 'red' : 'green';

                    return (
                      <div key={tag} className="flex flex-row gap-1 ">
                        <AsyncButton
                          callback={async () => {
                            const tags = await handleTag(tag, post.account_id, post.account_username, post.server_slug);
                            if (tags) {
                              updateAccountTags(post.account_id, tags);
                            }
                          }}
                          defaultText={hasTag ? `${tag}(${count})` : tag}
                          color={color}
                        />
                        {hasTag ? (
                          <AsyncButton
                            callback={async () => {
                              const tags = await handleClearTag(post.account_id, post.account_username, tag, post.server_slug);
                              if (tags) {
                                updateAccountTags(post.account_id, tags);
                              }
                            }}
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
