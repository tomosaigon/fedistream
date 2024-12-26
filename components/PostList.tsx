import React from 'react';

interface MediaAttachment {
  type: string;
  url?: string;
  preview_url?: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  url?: string;
  account_url: string;
  account_avatar: string;
  account_username: string;
  account_display_name: string;
  media_attachments: MediaAttachment[];
  visibility?: string;
  favourites_count?: number;
  reblogs_count?: number;
  replies_count?: number;
  card?: {
    url: string;
    title: string;
    description: string;
    image?: string;
    author_name?: string;
  } | null;
}

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4">
        {posts.map((post) => {
          // Debug logging
          console.log('Post ID:', post.id);
          console.log('Card data:', post.card);
          
          return (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex items-start space-x-3">
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
                  post.media_attachments.length === 1 ? 'grid-cols-1' : 
                  post.media_attachments.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {post.media_attachments.map((media, index) => (
                    media.type === 'image' && media.url && media.preview_url && (
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
          );
        })}
      </div>
    </div>
  );
};

export default PostList;