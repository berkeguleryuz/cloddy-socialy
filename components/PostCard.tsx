"use client";

import { memo, useState } from "react";
import Image from "next/image";
import HexagonAvatar from "./HexagonAvatar";
import PostActions from "./post/PostActions";
import PostComments from "./post/PostComments";
import PostOptionsMenu from "./post/PostOptionsMenu";

interface PostCardProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    time: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
}

const PostCard = memo(function PostCard({
  id,
  authorId,
  author,
  content,
  image,
  likes,
  comments,
  shares,
}: PostCardProps) {
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

      {/* Image */}
      {image ? (
        <div className="rounded-xl overflow-hidden mt-2 relative aspect-video">
          <Image
            src={image}
            alt="Post content"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
        </div>
      ) : null}

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

export default PostCard;
