"use client";

import { useState, memo } from "react";
import HexagonAvatar from "./HexagonAvatar";
import PostActions from "./post/PostActions";
import PostComments from "./post/PostComments";
import PostOptionsMenu from "./post/PostOptionsMenu";

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface PollPostProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    time: string;
  };
  question: string;
  options: PollOption[];
  totalVotes: number;
  likes: number;
  comments: number;
  shares: number;
}

const PollPost = memo(function PollPost({
  id,
  authorId,
  author,
  question,
  options: initialOptions,
  totalVotes: initialTotalVotes,
  likes,
  comments,
  shares,
}: PollPostProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [options, setOptions] = useState(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);

  const handleVote = () => {
    if (selectedOption !== null && !hasVoted) {
      setOptions(
        options.map((opt) =>
          opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
        )
      );
      setTotalVotes(totalVotes + 1);
      setHasVoted(true);
    }
  };

  return (
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
              <span className="text-xs text-text-muted">created a poll</span>
            </div>
            <span className="text-xs text-text-muted font-medium">
              {author.time}
            </span>
          </div>
        </div>
        <PostOptionsMenu postId={id} authorId={authorId} />
      </div>

      {/* Poll Question */}
      <div className="bg-linear-to-r from-primary/20 to-secondary/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-white flex-1">{question}</h4>
        </div>

        {/* Poll Options */}
        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const percentage =
              totalVotes > 0
                ? Math.round((option.votes / totalVotes) * 100)
                : 0;
            return (
              <div
                key={option.id}
                onClick={() => !hasVoted && setSelectedOption(option.id)}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                  hasVoted
                    ? "cursor-default"
                    : "hover:ring-2 hover:ring-primary/50"
                } ${selectedOption === option.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="relative z-10 flex items-center justify-between p-3 bg-background/80">
                  <div className="flex items-center gap-3">
                    {!hasVoted ? (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.id
                            ? "border-primary bg-primary"
                            : "border-text-muted"
                        }`}
                      >
                        {selectedOption === option.id ? (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {percentage}%
                      </span>
                    )}
                    <span className="text-sm font-medium text-white">
                      {option.text}
                    </span>
                  </div>
                  {hasVoted ? (
                    <span className="text-xs text-text-muted">
                      {option.votes} votes
                    </span>
                  ) : null}
                </div>
                {hasVoted ? (
                  <div
                    className="absolute inset-0 bg-linear-to-r from-primary/30 to-secondary/30"
                    style={{ width: `${percentage}%` }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Vote Button */}
        {!hasVoted ? (
          <button
            onClick={handleVote}
            disabled={selectedOption === null}
            className={`mt-4 w-full py-3 rounded-lg font-bold text-sm transition-all ${
              selectedOption !== null
                ? "bg-primary text-white hover:bg-primary/80"
                : "bg-background/50 text-text-muted cursor-not-allowed"
            }`}
          >
            Vote Now!
          </button>
        ) : null}

        {/* Total Votes */}
        <p className="text-center text-xs text-text-muted mt-3">
          {totalVotes} people have voted
        </p>
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

export default PollPost;
