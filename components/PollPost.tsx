"use client";

import { useState } from "react";
import HexagonAvatar from "./HexagonAvatar";

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface PollPostProps {
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

export default function PollPost({
  author,
  question,
  options: initialOptions,
  totalVotes: initialTotalVotes,
  likes,
  comments,
  shares,
}: PollPostProps) {
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
        <button className="text-text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
          </svg>
        </button>
      </div>

      {/* Poll Question */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-4">
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
                        {selectedOption === option.id && (
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
                        )}
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
                  {hasVoted && (
                    <span className="text-xs text-text-muted">
                      {option.votes} votes
                    </span>
                  )}
                </div>
                {hasVoted && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30"
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Vote Button */}
        {!hasVoted && (
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
        )}

        {/* Total Votes */}
        <p className="text-center text-xs text-text-muted mt-3">
          {totalVotes} people have voted
        </p>
      </div>

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
