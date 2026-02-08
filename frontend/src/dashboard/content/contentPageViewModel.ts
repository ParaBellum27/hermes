/**
 * ViewModel for Content Page
 * Manages state and business logic for browsing creator content
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ContentPost, Profile } from "@/types";
import { scraperClient } from "@/services/scraperClient";
import { contentApiClient } from "@/services/contentApiClient"; // Import contentApiClient
import {
  sortContentPosts,
  filterPostsByPerformance,
  calculateMultiplier,
  countPostsByPerformance,
  type ContentSortOption,
  type FilterType,
} from "@/services/contentSortingService";

const POSTS_PER_PAGE = 20;

export interface ContentPageViewModel {
  // Data
  allPosts: ContentPost[];
  filteredPosts: ContentPost[];
  visiblePosts: ContentPost[];
  creators: Profile[];

  // UI State
  isLoading: boolean;
  isLoadingMore: boolean;
  isAddingCreator: boolean;
  hasMore: boolean;

  // Filters
  filter: FilterType;
  sortBy: ContentSortOption;
  bangerCount: number;
  midCount: number;

  // Actions
  loadMore: () => void;
  handleFilterChange: (filter: FilterType) => void;
  handleSortChange: (sort: ContentSortOption) => void;
  handleAddCreator: (url: string) => Promise<void>;

  // Creator add result
  error: string | null;
  result: { message: string } | null;
  clearMessages: () => void;
}

export function useContentPageViewModel(userId?: string): ContentPageViewModel {
  const [allPosts, setAllPosts] = useState<ContentPost[]>([]);
  const [creators, setCreators] = useState<Profile[]>([]);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<ContentSortOption>("recent");
  const [isAddingCreator, setIsAddingCreator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string } | null>(null);

  // Create a map of creator avgReactions for O(1) lookup
  const creatorAvgMap = useMemo(() => {
    const map = new Map<number, number>();
    creators.forEach(c => map.set(c.id, c.avgReactions || 0));
    return map;
  }, [creators]);

  // Calculate multiplier for a post
  const getMultiplier = useCallback(
    (post: ContentPost) => {
      const avgReactions = creatorAvgMap.get(post.creatorId) || 0;
      return calculateMultiplier(post, avgReactions);
    },
    [creatorAvgMap]
  );

  // Filter posts based on performance
  const filteredPosts = useMemo(() => {
    return filterPostsByPerformance(allPosts, filter, getMultiplier);
  }, [allPosts, filter, getMultiplier]);

  // Sort filtered posts
  const sortedPosts = useMemo(() => {
    return sortContentPosts(filteredPosts, sortBy, getMultiplier);
  }, [filteredPosts, sortBy, getMultiplier]);

  // Infinite scroll - slice to visible count
  const visiblePosts = useMemo(() => {
    return sortedPosts.slice(0, visibleCount);
  }, [sortedPosts, visibleCount]);

  const hasMore = visibleCount < sortedPosts.length;

  // Count posts by performance category
  const performanceCounts = useMemo(() => {
    return countPostsByPerformance(allPosts, getMultiplier);
  }, [allPosts, getMultiplier]);

  // Load all data once
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch posts using contentApiClient
      const postsData = await contentApiClient.fetchCreatorContent(1000);

      // Fetch creators
      const creatorsUrl = userId
        ? `${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/creators/fetch?user_id=${userId}`
        : `${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/creators/fetch`;
      const creatorsRes = await fetch(creatorsUrl);
      if (!creatorsRes.ok) throw new Error('Failed to fetch creators');
      const { data: creatorsData } = await creatorsRes.json();

      setAllPosts(postsData);
      setCreators(creatorsData);
    } catch (err) {
      setError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load more posts for infinite scroll
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + POSTS_PER_PAGE);
      setIsLoadingMore(false);
    }, 200);
  }, [isLoadingMore, hasMore]);

  // Reset visible count when filter/sort changes
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
    setVisibleCount(POSTS_PER_PAGE);
  }, []);

  const handleSortChange = useCallback((newSort: ContentSortOption) => {
    setSortBy(newSort);
    setVisibleCount(POSTS_PER_PAGE);
  }, []);

  // Add a new creator
  const handleAddCreator = useCallback(
    async (url: string) => {
      if (!url.trim()) return;

      if (!url.includes("linkedin.com/in/")) {
        setError("Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username)");
        return;
      }

      setIsAddingCreator(true);
      setError(null);
      setResult(null);

      try {
        const data = await scraperClient.scrapeLinkedInProfiles([url]);

        if (data.success) {
          setResult({ message: `Added creator and fetched ${data.postsScraped} posts!` });
          // Reload data to show new posts
          await loadData();
          setVisibleCount(POSTS_PER_PAGE);
        } else {
          setError(data.error || "Failed to add creator");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add creator";
        setError(message);
      } finally {
        setIsAddingCreator(false);
      }
    },
    [loadData]
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    allPosts,
    filteredPosts: sortedPosts,
    visiblePosts,
    creators,
    isLoading,
    isLoadingMore,
    isAddingCreator,
    hasMore,
    filter,
    sortBy,
    bangerCount: performanceCounts.bangers,
    midCount: performanceCounts.mid,
    loadMore,
    handleFilterChange,
    handleSortChange,
    handleAddCreator,
    error,
    result,
    clearMessages,
  };
}
