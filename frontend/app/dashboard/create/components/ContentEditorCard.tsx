"use client";

import { DiffView } from "@/app/dashboard/components/shared/DiffView";
import type { GeneratedVersion } from "@/app/dashboard/components/SuggestedEditsCard/suggestedEditsViewModel";
import { PenLine, Check, X, Loader2, NotebookPen } from "lucide-react";

interface ContentEditorCardProps {
  userContent: string;
  setUserContent: (content: string) => void;
  isGeneratingInitial: boolean;
  currentVersion: GeneratedVersion | null;
  onAcceptEdit: () => void;
  onRejectEdit: () => void;
  onSaveSnapshot?: () => void;
  canSaveSnapshot?: boolean;
  isSavingSnapshot?: boolean;
}

export function ContentEditorCard({
  userContent,
  setUserContent,
  isGeneratingInitial,
  currentVersion,
  onAcceptEdit,
  onRejectEdit,
  onSaveSnapshot,
  canSaveSnapshot = true,
  isSavingSnapshot = false,
}: ContentEditorCardProps) {
  const wordCount = userContent.split(/\s+/).filter(Boolean).length;
  const charCount = userContent.length;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <PenLine className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Your Content</h2>
              <p className="text-xs text-gray-400">
                {currentVersion
                  ? <span className="text-emerald-500">+{currentVersion.additions}</span>
                  : `${wordCount} words`}
                {currentVersion
                  ? <span className="text-red-400 ml-2">-{currentVersion.deletions}</span>
                  : <span className="text-gray-300 mx-1">•</span>}
                {!currentVersion && `${charCount} chars`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveSnapshot && (
              <button
                onClick={onSaveSnapshot}
                disabled={!canSaveSnapshot || isSavingSnapshot}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all"
              >
                {isSavingSnapshot ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <NotebookPen className="w-4 h-4" />
                )}
                {isSavingSnapshot ? "Saving..." : "Save snapshot"}
              </button>
            )}
            {currentVersion && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onRejectEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={onAcceptEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {isGeneratingInitial ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 animate-ping" />
            </div>
            <p className="text-sm text-gray-400 mt-4">Generating your content...</p>
          </div>
        ) : currentVersion ? (
          <DiffView
            original={userContent}
            edited={currentVersion.suggestedText}
          />
        ) : (
          <textarea
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            placeholder="Select a post from the feed to get started, or start writing here..."
            className="w-full h-full text-gray-700 bg-transparent border-none resize-none focus:outline-none leading-relaxed placeholder:text-gray-300 text-[15px]"
          />
        )}
      </div>
    </div>
  );
}
