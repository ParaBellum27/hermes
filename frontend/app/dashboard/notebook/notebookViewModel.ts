/**
 * ViewModel for Notebook Page
 * Manages state and business logic for viewing and editing drafts
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { UserPost } from "@/types";
import { toast } from "react-toastify";
import { logger } from "@/lib/logger";

function getPostTitle(post: UserPost): string {
  if (post.title) {
    return post.title;
  }
  const text = post.rawText || "";
  const firstLine = text.split("\n").find((line) => line.trim().length > 0);
  if (firstLine) return firstLine.slice(0, 80);
  return "Untitled draft";
}

export interface NotebookViewModel {
  // Data
  posts: UserPost[];
  selectedPost: UserPost | null;
  filteredPosts: UserPost[];

  // UI State
  isFetching: boolean;
  isSaving: boolean;
  editorValue: string;
  searchQuery: string;
  isDirty: boolean;
  totalWordCount: number;

  // Actions
  setSearchQuery: (query: string) => void;
  setEditorValue: (value: string) => void;
  handleSelect: (post: UserPost) => void;
  handleSaveDraft: () => Promise<void>;
  handleDeleteDraft: (postId: string) => Promise<void>;
  handleEditInCreate: () => void;
}

export function useNotebookViewModel(userId?: string): NotebookViewModel {
  const router = useRouter();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Computed: selected post
  const selectedPost = useMemo(
    () => posts.find((post) => post.postId === selectedPostId) ?? null,
    [posts, selectedPostId]
  );

  // Computed: filtered posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const title = getPostTitle(post).toLowerCase();
      const body = (post.rawText || "").toLowerCase();
      return title.includes(q) || body.includes(q);
    });
  }, [posts, searchQuery]);

  // Computed: total word count across all posts
  const totalWordCount = useMemo(() => {
    return posts.reduce((acc, post) => {
      if (typeof post.wordCount === "number") {
        return acc + post.wordCount;
      }
      const words = post.rawText?.split(/\s+/).filter(Boolean).length ?? 0;
      return acc + words;
    }, 0);
  }, [posts]);

  // Computed: is editor dirty
  const isDirty = selectedPost ? editorValue !== (selectedPost.rawText ?? "") : false;

  // Load posts from API
  useEffect(() => {
    if (!userId) return;
    setIsFetching(true);

    fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-posts?user_id=${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        const { data } = await res.json();
        return data;
      })
      .then((fetchedPosts) => {
        setPosts(fetchedPosts);
        if (fetchedPosts.length > 0) {
          setSelectedPostId((prev) => prev ?? fetchedPosts[0].postId);
        } else {
          setSelectedPostId(null);
          setEditorValue("");
        }
      })
      .catch((error) => {
        logger.error("Failed to load notebook", error);
        toast.error("Failed to load notebook");
      })
      .finally(() => setIsFetching(false));
  }, [userId]);

  // Sync editor value when selected post changes
  useEffect(() => {
    if (selectedPost) {
      setEditorValue(selectedPost.rawText ?? "");
    } else {
      setEditorValue("");
    }
  }, [selectedPost]);

  // Action: select a post
  const handleSelect = useCallback((post: UserPost) => {
    setSelectedPostId(post.postId);
    setEditorValue(post.rawText ?? "");
  }, []);

  // Action: save draft
  const handleSaveDraft = useCallback(async () => {
    if (!selectedPost) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-posts/${selectedPost.postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: editorValue }),
      });

      if (!res.ok) throw new Error('Failed to save draft');
      const { data: updated } = await res.json();

      setPosts((prev) =>
        prev.map((post) => (post.postId === updated.postId ? updated : post))
      );
      toast.success("Draft saved");
    } catch (error) {
      logger.error("Failed to save draft", error);
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  }, [selectedPost, editorValue]);

  // Action: delete draft
  const handleDeleteDraft = useCallback(
    async (postId: string) => {
      if (!window.confirm("Delete this draft? This cannot be undone.")) {
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-posts/${postId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Failed to delete draft');

        setPosts((prev) => prev.filter((post) => post.postId !== postId));
        if (selectedPostId === postId) {
          setSelectedPostId(null);
          setEditorValue("");
        }
        toast.success("Draft deleted");
      } catch (error) {
        logger.error("Failed to delete draft", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete draft");
      }
    },
    [selectedPostId]
  );

  // Action: edit in create workspace
  const handleEditInCreate = useCallback(() => {
    if (!selectedPost) return;
    router.push(`/dashboard/create?draftId=${selectedPost.postId}`);
  }, [selectedPost, router]);

  return {
    posts,
    selectedPost,
    filteredPosts,
    isFetching,
    isSaving,
    editorValue,
    searchQuery,
    isDirty,
    totalWordCount,
    setSearchQuery,
    setEditorValue,
    handleSelect,
    handleSaveDraft,
    handleDeleteDraft,
    handleEditInCreate,
  };
}
