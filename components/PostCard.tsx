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

      <p className="text-sm leading-relaxed text-gray-200">{content}</p>

      {image && (
        <div className="rounded-xl overflow-hidden mt-2">
          <img
            src={image}
            alt="Post content"
            className="w-full h-auto hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </div>
            {likes}
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
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
                ></path>
              </svg>
            </div>
            {comments}
          </button>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
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
              ></path>
            </svg>
          </div>
          {shares}
        </button>
      </div>
    </div>
  );
}
