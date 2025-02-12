import { Post, IMediaAttachment } from "@/db/database";
import axios from "axios";
import React, { useEffect, useState } from "react";

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
  const [info, setInfo] = useState<Record<number, { width: number; height: number; fileSize: number }>>({});
  const DEBUG = false;

  useEffect(() => {
    if (!DEBUG) return;
    mediaAttachments.forEach((media, index) => {
      const fetchFileSize = async () => {
        try {
          const response = await axios.head(media.preview_url || '');
          const fileSize = Number(response.headers["content-length"]) || 0;
          setInfo((prev) => ({
            ...prev,
            [index]: { ...(prev[index] || { width: 0, height: 0 }), fileSize },
          }));
        } catch (error) {
          console.error("Error fetching file size:", error);
        }
      };

      fetchFileSize();
    });
  }, [mediaAttachments]);
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
              {DEBUG && (<>
                <span>File ext: {media.url.split('.').pop()}</span>
                {info[index] && (
                  <span className="text-xs px-1 rounded">
                    {info[index].width}x{info[index].height} •{" "}
                    {info[index].fileSize > 0 ? `${Math.round(info[index].fileSize / 1024)} KB` : "Size Unavailable"}
                  </span>
                )}
              </>)}
            <img
              src={media.preview_url}
              alt={media.description || "Image preview"}
              className={`w-full rounded-lg hover:opacity-90 transition-opacity ${
                mediaAttachments.length === 1 ? "h-auto" : "h-40 sm:h-48"
              } object-cover`}
              onLoad={(e) => {
                if (!DEBUG) return;
                const { naturalWidth, naturalHeight } = e.currentTarget;
                setInfo((prev) => ({
                  ...prev,
                  [index]: { ...(prev[index] || { fileSize: 0 }), width: naturalWidth, height: naturalHeight },
                }));
              }}
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
