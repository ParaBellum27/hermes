"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentFeed } from "@/app/dashboard/components/ContentFeed/ContentFeed";
import { useCreatePostViewModel } from "./createPostViewModel";
import { useContentEditorViewModel } from "./contentEditorViewModel";
import { EditHistory } from "../components/EditHistory/EditHistory";
import { PostViewModal } from "../components/PostViewModal";
import { useSuggestedEditsViewModel } from "../components/SuggestedEditsCard/suggestedEditsViewModel";
import { logger } from "@/lib/logger";
import { ContextGatheringModal } from "../components/ContextGatheringModal/ContextGatheringModal";
import { ChoiceModal } from "../components/ChoiceModal/ChoiceModal";
import { ContentEditorCard } from "./components/ContentEditorCard";
import { InspirationPostsCard } from "./components/InspirationPostsCard";
import { AIAssistantPanel } from "./components/AIAssistantPanel";
import type { ContentPost } from "@/types";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks";

function CreatePostPageContent() {
  const {
    filteredContentFeed,
    togglePostHighlight,
    getHighlightedPosts,
    clearAllHighlights,
    searchQuery,
    setSearchQuery,
    creatorProfiles,
  } = useCreatePostViewModel();
  const highlightedPosts = getHighlightedPosts();
  const [expandedPost, setExpandedPost] = useState<ContentPost | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [isSnapshotSaving, setIsSnapshotSaving] = useState(false);

  // Use content editor view model
  const {
    userContent,
    setUserContent,
    isGeneratingInitial,
    showContextModal,
    showChoiceModal,
    conversationHistory,
    handleContextComplete,
    handleContextSkip,
    closeContextModal,
    closeChoiceModal,
    handleUseAsInspiration,
    handleNoCustomNeeded,
    getPostContent,
  } = useContentEditorViewModel(highlightedPosts);

  // Build context from conversation for edits
  const userContext = React.useMemo(() => {
    const context: Record<string, string> = {};
    for (let i = 0; i < conversationHistory.length; i += 2) {
      const question = conversationHistory[i]?.content;
      const answer = conversationHistory[i + 1]?.content;
      if (question && answer) {
        context[question] = answer;
      }
    }
    return Object.keys(context).length > 0 ? context : undefined;
  }, [conversationHistory]);

  // Use suggested edits view model
  const editsVm = useSuggestedEditsViewModel(userContent, userContext);

  const draftId = searchParams?.get("draftId");

  React.useEffect(() => {
    if (!user?.id || !draftId) return;

    async function loadDraft() {
      if (!draftId || !user?.id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-posts/${draftId}`);
        if (!res.ok) {
          throw new Error('Failed to load draft');
        }
        const { data: post } = await res.json();
        if (!post) {
          toast.error("Draft not found");
          return;
        }
        setUserContent(post.rawText ?? "");
        setEditingPostId(post.postId);
        setEditingTitle(post.title ?? "");
        toast.success("Draft loaded from Notebook");
        router.replace("/dashboard/create");
      } catch (error) {
        // Error is handled by catch block
        toast.error(error instanceof Error ? error.message : "Failed to load draft");
      }
    }

    loadDraft();
  }, [draftId, user?.id, router]);

  function handleExpandPost(post: ContentPost) {
    setExpandedPost(post);
  }

  async function handleSaveSnapshot() {
    if (!user) {
      toast.error("Please sign in to save snapshots.");
      return;
    }

    if (!userContent.trim()) {
      toast.error("Write something before saving a snapshot.");
      return;
    }

    setIsSnapshotSaving(true);
    try {
      if (editingPostId) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-posts/${editingPostId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: userContent,
          }),
        });
        if (!res.ok) throw new Error('Failed to update snapshot');
        toast.success("Snapshot updated");
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            rawText: userContent,
          }),
        });
        if (!res.ok) {
          console.error('Save snapshot failed:', {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries())
          });
          const text = await res.text();
          console.error('Response body:', text);

          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = { error: text || 'Failed to create snapshot' };
          }

          throw new Error(errorData.error || 'Failed to create snapshot');
        }
        const { data: newPost } = await res.json();
        setEditingPostId(newPost.postId);
        toast.success("Snapshot saved to Notebook");
      }
    } catch (error) {
      logger.error("Failed to save snapshot", error);
      toast.error(error instanceof Error ? error.message : "Failed to save snapshot");
    } finally {
      setIsSnapshotSaving(false);
    }
  }

  return (
    <>
      <PostViewModal
        isOpen={expandedPost !== null}
        onClose={() => setExpandedPost(null)}
        title={expandedPost?.title || ""}
        author={expandedPost?.author || ""}
        timeAgo={expandedPost?.timeAgo || ""}
        content={expandedPost?.postRaw}
        postUrl={expandedPost?.postUrl}
      />
      <ChoiceModal
        isOpen={showChoiceModal}
        onUseAsInspiration={handleUseAsInspiration}
        onNoCustomNeeded={handleNoCustomNeeded}
        onClose={() => {
          closeChoiceModal();
          clearAllHighlights(true);
        }}
      />
      <ContextGatheringModal
        isOpen={showContextModal}
        postContent={getPostContent()}
        onComplete={handleContextComplete}
        onSkip={handleContextSkip}
        onClose={() => {
          closeContextModal();
          clearAllHighlights(true);
        }}
      />
      <div className="min-h-screen bg-grid overflow-x-hidden" style={{ backgroundColor: '#F9FAFB' }}>
        {/* Three Column Layout */}
        <div className="grid grid-cols-[380px_1fr_380px] gap-4 max-w-[1800px] mx-auto p-4 items-stretch min-h-[calc(100vh-120px)] overflow-hidden">
          {/* Left Column - Sidebar */}
          <div className="flex flex-col min-w-0">
            <ContentFeed
              posts={filteredContentFeed}
              postCount={filteredContentFeed.length}
              onTogglePost={togglePostHighlight}
              onExpandPost={handleExpandPost}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              creatorProfiles={creatorProfiles}
            />
          </div>

          {/* Middle Column - Your Content */}
          <div className="flex flex-col gap-4 min-w-0">
            <ContentEditorCard
              userContent={userContent}
              setUserContent={setUserContent}
              isGeneratingInitial={isGeneratingInitial}
              currentVersion={editsVm.currentVersion}
              onAcceptEdit={() => {
                if (editsVm.currentVersion) {
                  setUserContent(editsVm.currentVersion.suggestedText);
                }
                editsVm.handleReset();
              }}
              onRejectEdit={editsVm.handleReset}
              onSaveSnapshot={handleSaveSnapshot}
              canSaveSnapshot={userContent.trim().length > 0}
              isSavingSnapshot={isSnapshotSaving}
            />

            <InspirationPostsCard posts={highlightedPosts} creatorProfiles={creatorProfiles} />
          </div>

          {/* Right Column - AI Assistant Controls */}
          <div className="flex flex-col gap-4 min-w-0">
            <AIAssistantPanel
              isAiActive={editsVm.isAiActive}
              isVoiceMode={editsVm.isVoiceMode}
              toggleVoiceMode={editsVm.toggleVoiceMode}
              isListening={editsVm.isListening}
              startListening={editsVm.startListening}
              stopListening={editsVm.stopListening}
              feedbackText={editsVm.feedbackText}
              setFeedbackText={editsVm.setFeedbackText}
              silenceCountdown={editsVm.silenceCountdown}
              isGenerating={editsVm.isGenerating}
              canGenerate={userContent.trim() !== "" && editsVm.feedbackText.trim() !== ""}
              generateEdit={editsVm.generateEdit}
              versionHistoryCount={editsVm.versionHistory.length}
              onClearAll={editsVm.handleClearAll}
            />

            <EditHistory
              versionHistory={editsVm.versionHistory}
              onCopyVersion={editsVm.handleCopyVersion}
              className="bg-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePostPageContent />
    </Suspense>
  );
}
