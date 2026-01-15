"use client";

import HexagonAvatar from "./HexagonAvatar";

interface PostCardProps {
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

export default function PostCard({
  author,
  content,
  image,
  likes,
  comments,
  shares,
}: PostCardProps) {
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
        <button className="text-text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
          </svg>
        </button>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-gray-200">{content}</p>

      {/* Image */}
      {image ? (
        <div className="rounded-xl overflow-hidden mt-2">
          <img
            src={image}
            alt="Post content"
            className="w-full h-auto hover:scale-105 transition-transform duration-700"
          />
        </div>
      ) : null}

      {/* Actions - Icon only */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          <button
            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-muted hover:bg-secondary hover:text-white transition-all"
            title="React"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all"
            title="Comment"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <button
            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-muted hover:bg-accent-blue hover:text-white transition-all"
            title="Share"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <svg
              className="w-4 h-4 text-secondary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="font-bold">{likes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-bold">{comments}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="font-bold">{shares}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
