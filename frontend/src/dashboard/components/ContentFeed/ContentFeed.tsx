"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
import type { ContentPost, Profile } from "@/types";
import { Search, FileText, Flame, TrendingDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "bangers" | "mid";
const POSTS_PER_PAGE = 20;

interface ContentFeedProps {
  posts: ContentPost[];
  postCount?: number;
  onTogglePost?: (postId: number) => void;
  onExpandPost?: (post: ContentPost) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  creatorProfiles?: Profile[];
}

export function ContentFeed({
  posts,
  postCount = 30,
  onTogglePost,
  onExpandPost,
  searchQuery = "",
  onSearchChange,
  creatorProfiles = [],
}: ContentFeedProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  // Create a map of creator avgReactions for O(1) lookup
  const creatorAvgMap = useMemo(() => {
    const map = new Map<number, number>();
    creatorProfiles.forEach(c => map.set(c.id, c.avgReactions || 0));
    return map;
  }, [creatorProfiles]);

  // Calculate multiplier for a post
  const getMultiplier = (post: ContentPost) => {
    const avgReactions = creatorAvgMap.get(post.creatorId) || 0;
    const postReactions = post.stats?.total_reactions || 0;
    return avgReactions > 0 ? postReactions / avgReactions : 0;
  };

  // Filter posts based on performance
  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter(post => {
      const multiplier = getMultiplier(post);
      if (filter === "bangers") return multiplier >= 1.5;
      if (filter === "mid") return multiplier > 0 && multiplier < 0.7;
      return true;
    });
  }, [posts, filter, creatorAvgMap]);

  // Count bangers and mid posts
  const bangerCount = useMemo(() =>
    posts.filter(p => getMultiplier(p) >= 1.5).length,
    [posts, creatorAvgMap]
  );
  const midCount = useMemo(() =>
    posts.filter(p => { const m = getMultiplier(p); return m > 0 && m < 0.7; }).length,
    [posts, creatorAvgMap]
  );

  // Slice to visible count for pagination
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // Infinite scroll with Intersection Observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Small delay for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => prev + POSTS_PER_PAGE);
      setIsLoadingMore(false);
    }, 200);
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  function handleFilterChange(newFilter: FilterType) {
    setFilter(newFilter);
    setVisibleCount(POSTS_PER_PAGE); // Reset pagination on filter change
  }

  return (
    <section className="flex flex-col flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Content Feed</h2>
            <p className="text-xs text-gray-400">{postCount} posts available</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => handleFilterChange("all")}
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
          >
            All ({posts.length})
          </Button>
          <Button
            onClick={() => handleFilterChange("bangers")}
            variant={filter === "bangers" ? "default" : "ghost"}
            size="sm"
            className={filter === "bangers" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <Flame className="w-3.5 h-3.5" />
            Bangers ({bangerCount})
          </Button>
          <Button
            onClick={() => handleFilterChange("mid")}
            variant={filter === "mid" ? "default" : "ghost"}
            size="sm"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Mid ({midCount})
          </Button>
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              placeholder="Search posts or creators..."
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border-0 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              {filter === "all" ? "No posts found" : `No ${filter} posts found`}
            </p>
          </div>
        ) : (
          <>
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                author={post.author}
                timeAgo={post.timeAgo}
                isHighlighted={post.isHighlighted}
                onToggle={onTogglePost ? () => onTogglePost(post.id) : undefined}
                onExpand={onExpandPost ? () => onExpandPost(post) : undefined}
                stats={post.stats}
                avgReactions={creatorAvgMap.get(post.creatorId) || 0}
              />
            ))}
            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore && (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
