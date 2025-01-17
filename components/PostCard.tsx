// components/PostCard.tsx
import React from 'react';

interface PostCardProps {
  card: {
    url: string;
    image?: string;
    title?: string;
    description?: string;
    author_name?: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({ card }) => {
  if (!card?.url) return null;

  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 block border rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
    >
      <div className="flex">
        {card.image && (
          <div className="flex-shrink-0 w-48">
            <img
              src={card.image}
              alt={card.description || 'Card image'}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        <div className="p-4 flex-grow">
          <h3 className="font-semibold text-lg line-clamp-2">
            {card.title || 'No title'}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {card.description || 'No description'}
          </p>
          {card.author_name && (
            <p className="text-gray-500 text-sm mt-2">
              By {card.author_name}
            </p>
          )}
        </div>
      </div>
    </a>
  );
};

export default PostCard;
