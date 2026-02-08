"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useContextGatheringViewModel } from "./contextGatheringViewModel";
import { Sparkles, Send, Check } from "lucide-react";

interface ContextGatheringModalProps {
  isOpen: boolean;
  postContent: string;
  skipQuestions?: boolean;
  onComplete: (conversationHistory: Array<{ role: "assistant" | "user"; content: string }>) => void;
  onSkip: () => void;
  onClose?: () => void;
}

export function ContextGatheringModal({
  isOpen,
  postContent,
  onComplete,
  onSkip,
  onClose,
}: ContextGatheringModalProps) {
  const vm = useContextGatheringViewModel(postContent);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [vm.conversationHistory, vm.isAskingQuestion]);

  // When ready to generate, call onComplete
  useEffect(() => {
    if (vm.isReadyToGenerate && isOpen) {
      onComplete(vm.conversationHistory);
      vm.reset();
    }
  }, [vm.isReadyToGenerate, isOpen, onComplete, vm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={() => onClose?.()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto cursor-default bg-white rounded-3xl border border-gray-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gray-50 border-b border-gray-100 overflow-hidden rounded-t-3xl">

          <div className="relative flex flex-col items-center gap-2">
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4 text-gray-700" />
                Getting to know you
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {vm.isAskingQuestion
                  ? "Thinking..."
                  : "Answer a few questions to personalize your content"}
              </p>

              {/* Progress indicator */}
              {vm.conversationHistory.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">
                      Question {Math.ceil(vm.conversationHistory.length / 2)} of ~5
                    </span>
                  </div>
                  <div className="w-full max-w-[200px] mx-auto h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 transition-all duration-500"
                      style={{
                        width: `${Math.min((Math.ceil(vm.conversationHistory.length / 2) / 5) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Starting/Loading Step */}
          {(vm.modalStep === "initial" || vm.modalStep === "analyzing") && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <p className="text-sm text-gray-600">Getting ready...</p>
            </div>
          )}

          {/* Questioning Step */}
          {vm.modalStep === "questioning" && (
            <div className="space-y-5">
              {/* Conversation */}
              <div className="space-y-4">
                <div className="space-y-3 max-h-[280px] overflow-y-auto p-1">
                  {vm.conversationHistory.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-2xl",
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100 text-gray-700"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-8 shadow-lg shadow-purple-500/20"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  ))}
                  {vm.isAskingQuestion && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                        <span className="text-sm text-gray-500 ml-1">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Answer Input - only show if last message is from assistant */}
                {vm.conversationHistory.length > 0 &&
                  vm.conversationHistory[vm.conversationHistory.length - 1]?.role === "assistant" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Your answer</label>
                      </div>
                      <textarea
                        placeholder="Type your answer..."
                        value={vm.currentAnswer}
                        onChange={(e) => vm.setCurrentAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            vm.handleSubmitAnswer();
                          }
                        }}
                        disabled={vm.isAskingQuestion}
                        className="w-full min-h-[80px] text-sm text-gray-700 bg-gray-50 border-0 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white leading-relaxed disabled:opacity-50 placeholder:text-gray-400 transition-all"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            vm.handleSkip();
                            onSkip();
                          }}
                          disabled={vm.isAskingQuestion}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Done
                        </button>
                        <button
                          onClick={vm.handleSubmitAnswer}
                          disabled={!vm.currentAnswer.trim() || vm.isAskingQuestion}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                          {vm.isAskingQuestion ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
