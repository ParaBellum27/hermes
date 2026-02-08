"use client";

import Link from "next/link";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NotebookPen, Search, Save, Trash2, Loader2, Sparkles, Clock3, BookOpen, Pencil } from "lucide-react";
import type { UserPost } from "@/types";
import { formatTimeAgo } from "@/lib/formatters";
import { useNotebookViewModel } from "./notebookViewModel";

function getPostTitle(post: UserPost): string {
  if (post.title) {
    return post.title;
  }
  const text = post.rawText || "";
  const firstLine = text.split("\n").find((line) => line.trim().length > 0);
  if (firstLine) return firstLine.slice(0, 80);
  return "Untitled draft";
}

export default function NotebookPage() {
  const { user, isLoading } = useAuth();

  // Use ViewModel for all state and business logic
  const {
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
  } = useNotebookViewModel(user?.id);

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading Notebook...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-500">Log in to access your Notebook and manage drafts.</p>
        </div>
      </div>
    );
  }

  const showEmptyState = posts.length === 0;

  return (
    <div className="min-h-screen bg-grid" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-sky-500 flex items-center gap-2">
                <NotebookPen className="w-4 h-4" />
                Notebook
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">Save drafts, revisit later</h1>
              <p className="text-sm text-gray-500 max-w-2xl">
                Keep experiments, half-written hooks, and polished drafts in one place. Everything auto-sorted by freshness so you can pick up exactly where you left off.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Drafts</p>
                  <p className="text-2xl font-semibold text-gray-900">{posts.length}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Words saved</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalWordCount.toLocaleString()}</p>
                </div>
              </div>
              <Button asChild className="justify-center">
                <Link href="/dashboard/create">Go to Create workspace</Link>
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Use &ldquo;Save snapshot&rdquo; on Create to capture new drafts.
              </p>
            </div>
          </div>
        </section>

        {showEmptyState ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Capture your first idea</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Use Notebook to store hooks, outlines, and finished drafts. Highlight inspiration from the Content Feed and keep iterating here until it is ready to ship.
            </p>
            <Button asChild className="mt-2">
              <Link href="/dashboard/create">Open Create workspace</Link>
            </Button>
            <p className="text-xs text-gray-400">Click &ldquo;Save snapshot&rdquo; on the Create tab to send drafts here.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <aside className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 flex flex-col">
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search drafts..."
                  className="pl-11 bg-gray-50 border-0 text-sm"
                />
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {filteredPosts.map((post) => {
                  const title = getPostTitle(post);
                  const isActive = post.postId === selectedPost?.postId;
                  return (
                    <button
                      key={post.postId}
                      onClick={() => handleSelect(post)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "border-gray-900 bg-gray-900 text-white shadow-lg"
                          : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>{formatTimeAgo(post.updatedAt)}</span>
                        <span className={isActive ? "text-white/80" : "text-gray-400"}>Draft</span>
                      </div>
                      <h3 className={`mt-1 text-sm font-semibold ${isActive ? "text-white" : "text-gray-900"}`}>
                        {title}
                      </h3>
                      <p className={`mt-1 line-clamp-2 text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>
                        {post.rawText || "No content yet"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col">
              {selectedPost ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Draft workspace
                      </p>
                      <h2 className="text-2xl font-semibold text-gray-900">{getPostTitle(selectedPost)}</h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock3 className="w-3 h-3" />
                        Updated {formatTimeAgo(selectedPost.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={handleEditInCreate}
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit in Create
                      </Button>
                      <Button
                        onClick={handleSaveDraft}
                        disabled={!isDirty || isSaving}
                        className="gap-2"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Saving" : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteDraft(selectedPost.postId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Textarea
                      value={editorValue}
                      onChange={(e) => setEditorValue(e.target.value)}
                      placeholder="Write, paste, or iterate on your post here..."
                      className="w-full h-full min-h-[420px] text-base bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col flex-1 items-center justify-center text-center py-24">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <NotebookPen className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Select a draft</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm">
                    Choose a draft on the left to keep writing, or hop to the Create workspace to capture something new.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
