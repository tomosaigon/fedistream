import { Post, IMediaAttachment } from "@/db/database";
import React from "react";

interface MediaAttachmentProps {
  post: Post;
  mediaAttachments: IMediaAttachment[];
  setActiveImage: (media: IMediaAttachment) => void;
  setActivePost: (post: Post) => void;
}

const MediaAttachment: React.FC<MediaAttachmentProps> = ({
  post,
  mediaAttachments,
  setActiveImage,
  setActivePost,
}) => {
  return (
    <div
      className={`grid gap-2 p-3 sm:p-4 ${
        mediaAttachments.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {mediaAttachments.map((media, index) =>
        media.type === "video" ? (
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
        ) : media.type === "image" && media.url && media.preview_url ? (
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
              alt={media.description || "Image preview"}
              className={`w-full rounded-lg hover:opacity-90 transition-opacity ${
                mediaAttachments.length === 1 ? "h-auto" : "h-40 sm:h-48"
              } object-cover`}
            />
            {media.description && (
              <span className="text-xs px-1 rounded">{media.description}</span>
            )}
          </div>
        ) : null
      )}
    </div>
  );
};

export default MediaAttachment;

// const renderMediaAttachments = (post: Post, mediaAttachments: MediaAttachment[]) => (
//   <div className={`grid gap-2 p-3 sm:p-4 ${
//     mediaAttachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
//   }`}>
//     {mediaAttachments.map((media, index) => (
//       media.type === 'video' ? (
//         <div key={index} className="relative pt-[56.25%]">
//           <video 
//             className="absolute inset-0 w-full h-full rounded-lg"
//             controls
//             preload="metadata"
//             poster={media.preview_url}
//           >
//             <source src={media.url} type="video/mp4" />
//             Your browser does not support video playback.
//           </video>
//         </div>
//       ) : media.type === 'image' && media.url && media.preview_url && (
//         <div 
//           key={index}
//           onClick={() => {
//             setActiveImage(media);
//             setActivePost(post);
//           }}
//           className="cursor-zoom-in"
//         >
//           <img
//             src={media.preview_url}
//             alt={media.description}
//             className={`w-full rounded-lg hover:opacity-90 transition-opacity ${
//               mediaAttachments.length === 1 ? 'h-auto' : 'h-40 sm:h-48'
//             } object-cover`}
//           />
//           <span className="text-xs px-1 rounded">
//             {media.description}
//           </span>
//         </div>
//       )
//     ))}
//   </div>
// );