"use client";

import { memo, useState } from "react";
import Image from "next/image";
import HexagonAvatar from "./HexagonAvatar";
import PostActions from "./post/PostActions";
import PostComments from "./post/PostComments";
import PostOptionsMenu from "./post/PostOptionsMenu";

interface VideoPostProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    time: string;
  };
  content: string;
  videoThumbnail: string;
  videoTitle: string;
  videoDuration: string;
  videoViews: string;
  likes: number;
  comments: number;
  shares: number;
}

const VideoPost = memo(function VideoPost({
  id,
  authorId,
  author,
  content,
  videoThumbnail,
  videoTitle,
  videoDuration,
  videoViews,
  likes,
  comments,
  shares,
}: VideoPostProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <div className="widget-box flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <HexagonAvatar src={author.avatar} level={author.level} size="md" />
          <div className="flex flex-col">
            <h3 className="text-sm font-bold hover:text-primary cursor-pointer transition-colors leading-tight">
              {author.name}
            </h3>
            <span className="text-xs text-text-muted font-medium">
              {author.time}
            </span>
          </div>
        </div>
        <PostOptionsMenu postId={id} authorId={authorId} />
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-gray-200">{content}</p>

      {/* Video Thumbnail */}
      <div className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer">
        <Image
          src={videoThumbnail}
          alt={videoTitle}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          {videoDuration}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-main">{videoTitle}</h4>
        <span className="text-xs text-text-muted">{videoViews} views</span>
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
  );
});

export default VideoPost;
