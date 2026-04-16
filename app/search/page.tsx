"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useSearch, SearchType, SearchResult } from "@/hooks/useSearch"

const searchTabs: { id: SearchType; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🔍" },
  { id: "users", label: "People", icon: "👥" },
  { id: "posts", label: "Posts", icon: "📝" },
  { id: "groups", label: "Groups", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
]

function SearchResultCard({ result }: { result: SearchResult }) {
  const getLink = () => {
    switch (result.type) {
      case "user":
        return `/members/${result.id}`
      case "post":
        return `/posts/${result.id}`
      case "group":
        return `/groups/${result.id}`
      case "event":
        return `/events/${result.id}`
      default:
        return "#"
    }
  }

  const getTypeLabel = () => {
    switch (result.type) {
      case "user":
        return "Person"
      case "post":
        return "Post"
      case "group":
        return "Group"
      case "event":
        return "Event"
      default:
        return ""
    }
  }

  const getTypeColor = () => {
    switch (result.type) {
      case "user":
        return "bg-primary/20 text-primary"
      case "post":
        return "bg-secondary/20 text-secondary"
      case "group":
        return "bg-accent-blue/20 text-accent-blue"
      case "event":
        return "bg-accent-orange/20 text-accent-orange"
      default:
        return "bg-white/10 text-white"
    }
  }

  return (
    <Link href={getLink()}>
      <div className="widget-box p-4 hover:border-primary/50 transition-all cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
            <Image
              src={result.avatar || "/images/avatars/avatar_01.png"}
              alt={result.name}
              fill
              className="object-cover"
            />
            {result.type === "user" && result.isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-surface" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${getTypeColor()}`}>
                {getTypeLabel()}
              </span>
              {result.type === "user" && result.level && (
                <span className="text-xs text-text-muted">Level {result.level}</span>
              )}
              {result.type === "group" && result.isPrivate && (
                <span className="text-xs text-accent-orange">🔒 Private</span>
              )}
            </div>

            <h3 className="font-bold text-white truncate">{result.name}</h3>

            {result.description && (
              <p className="text-sm text-text-muted line-clamp-2 mt-1">{result.description}</p>
            )}

            {/* Extra info based on type */}
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              {result.type === "post" && result.authorName && (
                <span>by {result.authorName}</span>
              )}
              {result.type === "group" && result.membersCount !== undefined && (
                <span>{result.membersCount} members</span>
              )}
              {result.type === "event" && (
                <>
                  {result.startDate && (
                    <span>{new Date(result.startDate).toLocaleDateString()}</span>
                  )}
                  {result.location && <span>📍 {result.location}</span>}
                  {result.participantsCount !== undefined && (
                    <span>{result.participantsCount} attending</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [activeTab, setActiveTab] = useState<SearchType>("all")
  const [inputValue, setInputValue] = useState(initialQuery)

  const { search, results, allResults, isLoading, hasResults, totalCount, clearSearch } = useSearch({
    type: activeTab,
    limit: 20,
  })

  // Search on initial load if query param exists
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search(inputValue)
  }

  const getResultsForTab = () => {
    if (activeTab === "all") return allResults
    return results?.[activeTab === "users" ? "users" : activeTab] || []
  }

  const tabResults = getResultsForTab()

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="widget-box p-6">
        <h1 className="text-2xl font-black uppercase tracking-wider mb-4">Search</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for people, posts, groups, events..."
            className="w-full px-5 py-4 pl-12 bg-background rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("")
                clearSearch()
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="widget-box p-0! overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {searchTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="px-6 py-3 border-b border-border bg-background/50">
          {isLoading ? (
            <span className="text-sm text-text-muted">Searching...</span>
          ) : hasResults ? (
            <span className="text-sm text-text-muted">
              Found {totalCount} result{totalCount !== 1 ? "s" : ""}
            </span>
          ) : inputValue.length >= 2 ? (
            <span className="text-sm text-text-muted">No results found</span>
          ) : (
            <span className="text-sm text-text-muted">Enter at least 2 characters to search</span>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="widget-box p-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-background rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-20 h-4 bg-background rounded animate-pulse" />
                  <div className="w-3/4 h-5 bg-background rounded animate-pulse" />
                  <div className="w-full h-4 bg-background rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : hasResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabResults.map((result) => (
            <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>
      ) : inputValue.length >= 2 ? (
        <div className="widget-box p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-text-muted">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : (
        <div className="widget-box p-12 text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-bold mb-2">Start searching</h3>
          <p className="text-text-muted">
            Find people, posts, groups, and events across the platform
          </p>
        </div>
      )}
    </div>
  )
}
