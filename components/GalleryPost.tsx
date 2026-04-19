"use client";

import { useState, memo } from "react";
import Image from "next/image";
import HexagonAvatar from "./HexagonAvatar";
import PostActions from "./post/PostActions";
import PostComments from "./post/PostComments";
import PostOptionsMenu from "./post/PostOptionsMenu";

interface GalleryPostProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    time: string;
  };
  content: string;
  images: string[];
  likes: number;
  comments: number;
  shares: number;
}

const GalleryPost = memo(function GalleryPost({
  id,
  authorId,
  author,
  content,
  images,
  likes,
  comments,
  shares,
}: GalleryPostProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="widget-box flex flex-col gap-4 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HexagonAvatar src={author.avatar} level={author.level} size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold hover:text-primary cursor-pointer transition-colors leading-tight">
                  {author.name}
                </h3>
                <span className="text-xs text-text-muted">
                  uploaded {images.length} new photos
                </span>
              </div>
              <span className="text-xs text-text-muted font-medium">
                {author.time}
              </span>
            </div>
          </div>
          <PostOptionsMenu postId={id} authorId={authorId} />
        </div>

        {/* Content */}
        {content ? (
          <p className="text-sm leading-relaxed text-gray-200">{content}</p>
        ) : null}

        {/* Photo Grid */}
        <div
          className={`grid gap-2 ${
            displayImages.length === 1
              ? "grid-cols-1"
              : displayImages.length === 2
              ? "grid-cols-2"
              : displayImages.length === 3
              ? "grid-cols-3"
              : "grid-cols-3 grid-rows-2"
          }`}
        >
          {displayImages.map((image, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className={`relative rounded-xl overflow-hidden cursor-pointer group aspect-square ${
                displayImages.length === 4 && index === 0
                  ? "col-span-2 row-span-2"
                  : displayImages.length === 5 && index < 2
                  ? "col-span-1 row-span-1"
                  : displayImages.length === 5 && index >= 2
                  ? "col-span-1"
                  : ""
              }`}
            >
              <Image
                src={image}
                alt={`Gallery photo ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 200px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* Remaining count overlay */}
              {index === displayImages.length - 1 && remainingCount > 0 ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    +{remainingCount}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <PostActions
          postId={id}
          initialLikes={likes}
          initialComments={comments}
          initialShares={shares}
          onCommentClick={() => setCommentsOpen((prev) => !prev)}
        />

        {commentsOpen && <PostComments postId={id} />}
      </div>

      {/* Lightbox */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImage((prev) =>
                prev > 0 ? prev - 1 : images.length - 1
              );
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="relative max-w-full max-h-[90vh] w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[currentImage]}
              alt={`Photo ${currentImage + 1}`}
              fill
              className="object-contain rounded-xl"
              sizes="90vw"
            />
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImage((prev) =>
                prev < images.length - 1 ? prev + 1 : 0
              );
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImage + 1} / {images.length}
          </div>
        </div>
      ) : null}
    </>
  );
});

export default GalleryPost;
