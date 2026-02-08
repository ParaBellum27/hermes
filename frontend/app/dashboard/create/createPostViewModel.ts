import { useState, useEffect } from "react";
import type { ContentPost, Profile } from "@/types";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks";

export function useCreatePostViewModel() {
  const { user, getAccessToken } = useAuth();
  const [contentFeed, setContentFeed] = useState<ContentPost[]>([]);
  const [creatorProfiles, setCreatorProfiles] = useState<Profile[]>([]);
  const [pendingCreatorIds, setPendingCreatorIds] = useState<Set<number>>(
    new Set<number>()
  );
  const [selectedCreatorId, setSelectedCreatorId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  function setPending(creatorId: number, pending: boolean) {
    setPendingCreatorIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(creatorId);
      } else {
        next.delete(creatorId);
      }
      return next;
    });
  }

  // Fetch creator content and profiles from API
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch posts
        const postsRes = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/content/fetch?limit=1000`);
        if (!postsRes.ok) throw new Error('Failed to fetch posts');
        const { data: posts } = await postsRes.json();

        // Fetch creators
        const creatorsUrl = user?.id
          ? `${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/creators/fetch?user_id=${user.id}`
          : `${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/creators/fetch`;
        const creatorsRes = await fetch(creatorsUrl);
        if (!creatorsRes.ok) throw new Error('Failed to fetch creators');
        const { data: creators } = await creatorsRes.json();

        if (isMounted) {
          setContentFeed(posts);
          setCreatorProfiles(creators);
          setPendingCreatorIds(new Set<number>());
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load content. Please try again.");
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Toggle post highlight state
  function togglePostHighlight(postId: number) {
    // Get current state before updating
    const post = contentFeed.find((p) => p.id === postId);
    const newState = !post?.isHighlighted;

    setContentFeed((prevFeed) =>
      prevFeed.map((post) =>
        // If highlighting this post, unhighlight all others
        // If unhighlighting, just unhighlight this one
        post.id === postId
          ? { ...post, isHighlighted: !post.isHighlighted }
          : newState
          ? { ...post, isHighlighted: false }
          : post
      )
    );

    // Show toast after state update
    toast.info(
      newState ? "Post selected for inspiration" : "Post deselected"
    );
  }

  // Get all highlighted posts
  function getHighlightedPosts() {
    return contentFeed.filter((post) => post.isHighlighted);
  }

  // Filter posts by followed creators, selected creator, AND search query
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Get set of followed creator IDs for efficient lookup
  const followedCreatorIds = new Set(
    creatorProfiles.filter(p => p.isFollowed).map(p => p.id)
  );

  const filteredContentFeed = contentFeed.filter((post) => {
    // Stage 0: Only show posts from followed creators
    if (!followedCreatorIds.has(post.creatorId)) {
      return false;
    }

    // Stage 1: Filter by selected creator (or show all if none selected)
    const matchesCreator =
      selectedCreatorId === null || post.creatorId === selectedCreatorId;

    if (!matchesCreator) {
      return false;
    }

    // Stage 2: Filter by search query across multiple fields
    // If no search query, pass all posts that matched creator filter
    if (!normalizedQuery) {
      return true;
    }

    // Search across title, author name, and post content
    const haystacks = [post.title, post.author, post.postRaw ?? ""];
    return haystacks.some((value) =>
      value.toLowerCase().includes(normalizedQuery)
    );
  });

  function clearCreatorFilter() {
    setSelectedCreatorId(null);
  }

  function clearSearchQuery() {
    setSearchQuery("");
  }

  // Clear all highlights
  function clearAllHighlights(silent = false) {
    const highlightCount = contentFeed.filter((post) => post.isHighlighted).length;
    if (highlightCount > 0) {
      setContentFeed((prevFeed) =>
        prevFeed.map((post) => ({ ...post, isHighlighted: false }))
      );
      if (!silent) {
        toast.success(
          `Cleared ${highlightCount} highlighted post${
            highlightCount > 1 ? "s" : ""
          }`
        );
      }
    } else if (!silent) {
      toast.info("No highlights to clear");
    }
  }

  /**
   * Follow a creator with optimistic UI updates
   * Implementation strategy:
   * 1. Immediately update UI to show "followed" state (optimistic)
   * 2. Send API request to backend
   * 3. If request fails, rollback UI to previous state
   * This provides instant feedback to users while handling network failures gracefully
   */
  async function followCreator(creatorId: number) {
    if (!user) {
      toast.error("Please sign in to follow creators.");
      return;
    }

    // Prevent duplicate requests while one is in progress
    if (pendingCreatorIds.has(creatorId)) {
      return;
    }

    const targetProfile = creatorProfiles.find(
      (profile) => profile.id === creatorId
    );

    if (!targetProfile || targetProfile.isFollowed) {
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast.error("Session expired. Please sign in again.");
      return;
    }

    // Save current state for potential rollback
    const previousState = {
      isFollowed: targetProfile.isFollowed,
      followedAt: targetProfile.followedAt,
    };

    // Optimistically update UI before API call
    setCreatorProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === creatorId
          ? { ...profile, isFollowed: true, followedAt: new Date().toISOString() }
          : profile
      )
    );

    setPending(creatorId, true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/creators/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });

      if (!res.ok) throw new Error('Failed to follow creator');

      toast.success("Creator followed.");
    } catch (error) {
      // Rollback to previous state on error
      setCreatorProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.id === creatorId
            ? { ...profile, isFollowed: previousState.isFollowed, followedAt: previousState.followedAt }
            : profile
        )
      );

      const message =
        error instanceof Error ? error.message : "Failed to follow creator.";
      toast.error(message);
    } finally {
      setPending(creatorId, false);
    }
  }

  /**
   * Unfollow a creator with optimistic UI updates
   * Same pattern as followCreator but in reverse - see followCreator for detailed explanation
   */
  async function unfollowCreator(creatorId: number) {
    if (!user) {
      toast.error("Please sign in to unfollow creators.");
      return;
    }

    if (pendingCreatorIds.has(creatorId)) {
      return;
    }

    const targetProfile = creatorProfiles.find(
      (profile) => profile.id === creatorId
    );

    if (!targetProfile || !targetProfile.isFollowed) {
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast.error("Session expired. Please sign in again.");
      return;
    }

    const previousState = {
      isFollowed: targetProfile.isFollowed,
      followedAt: targetProfile.followedAt,
    };

    // Optimistically update UI to show unfollowed state
    setCreatorProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === creatorId ? { ...profile, isFollowed: false, followedAt: undefined } : profile
      )
    );

    setPending(creatorId, true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/creators/unfollow`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });

      if (!res.ok) throw new Error('Failed to unfollow creator');

      toast.success("Creator unfollowed.");
    } catch (error) {
      // Rollback on error
      setCreatorProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.id === creatorId
            ? { ...profile, isFollowed: previousState.isFollowed, followedAt: previousState.followedAt }
            : profile
        )
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to unfollow creator.";
      toast.error(message);
    } finally {
      setPending(creatorId, false);
    }
  }

  return {
    contentFeed,
    filteredContentFeed,
    creatorProfiles,
    pendingCreatorIds,
    user,
    togglePostHighlight,
    getHighlightedPosts,
    clearAllHighlights,
    selectedCreatorId,
    setSelectedCreatorId,
    clearCreatorFilter,
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    followCreator,
    unfollowCreator,
  };
}
