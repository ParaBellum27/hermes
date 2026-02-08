/**
 * SuggestedEditsCard - AI-powered component that generates content variations
 * Features: generates multiple versions of input content, tracks version history, text-to-speech playback
 */
"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSuggestedEditsViewModel } from "./suggestedEditsViewModel"
import { DiffView } from "../shared/DiffView"

interface SuggestedEditsCardProps {
  className?: string
  vm: ReturnType<typeof useSuggestedEditsViewModel>
  onAcceptEdit?: (editedContent: string) => void
}

export function SuggestedEditsCard({ className, vm, onAcceptEdit }: SuggestedEditsCardProps) {

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className="pb-6">
        <div className="flex flex-col items-center gap-4">
          {/* AI Avatar */}
          <div className="relative h-20 w-20 shrink-0">
            {/* Background circle */}
            <div className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              vm.isAiActive
                ? "bg-gradient-to-br from-[#5578C8] to-[#7B9EE8] shadow-lg shadow-[#5578C8]/40 animate-pulse"
                : "bg-gradient-to-br from-[#5578C8] to-[#7B9EE8] shadow-md shadow-[#5578C8]/20"
            )}>
              {/* Glossy overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
            </div>

            {/* Spinning ring when active */}
            {vm.isAiActive && (
              <div
                className="absolute -inset-1 rounded-full border-2 border-transparent border-t-white/60 border-r-white/40 animate-spin"
              />
            )}

            {/* Muse Logo */}
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <Image
                src="/logo.png"
                alt="Muse"
                width={40}
                height={40}
                className={cn(
                  "transition-transform duration-500 brightness-0 invert",
                  vm.isAiActive && "scale-110"
                )}
                style={{
                  mixBlendMode: "normal",
                }}
              />
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            <CardTitle className="text-lg font-semibold">Muse - AI Assistant</CardTitle>
            {vm.isAiActive && (
              <p className="text-sm text-muted-foreground mt-0.5">
                ✨ Working on it...
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Voice Mode Toggle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Voice Mode</label>
            <button
              onClick={vm.toggleVoiceMode}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                vm.isVoiceMode ? "bg-[#5578C8]" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  vm.isVoiceMode ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500">Chrome browser required</p>
        </div>

        {/* Feedback Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">What would you like to change?</label>
              {vm.silenceCountdown !== null && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Sending in {vm.silenceCountdown.toFixed(1)}s...
                </span>
              )}
            </div>
            {vm.isVoiceMode && (
              <button
                onClick={vm.isListening ? vm.stopListening : vm.startListening}
                disabled={vm.isGenerating}
                className={cn(
                  "p-2 rounded-full transition-all",
                  vm.isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#5578C8] text-white hover:bg-[#4A6AB8]"
                )}
              >
                {vm.isListening ? "🔴" : "🎤"}
              </button>
            )}
          </div>
          <Textarea
            placeholder={vm.isVoiceMode ? "Click the mic to speak..." : "e.g., Make it more professional, shorter, add emojis..."}
            value={vm.isListening ? "Listening..." : vm.feedbackText}
            onChange={(e) => vm.setFeedbackText(e.target.value)}
            disabled={vm.isListening}
            className="min-h-[100px]"
          />
        </div>

        {/* Edit Button */}
        <div className="flex gap-2">
          <Button
            onClick={vm.generateEdit}
            disabled={!vm.inputText.trim() || !vm.feedbackText.trim() || vm.isGenerating}
            className="flex-1"
          >
            {vm.isGenerating ? "Editing..." : "✨ Edit Content"}
          </Button>
          {vm.versionHistory.length > 0 && (
            <Button
              variant="ghost"
              onClick={vm.handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Current Version */}
        {vm.currentVersion && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                LATEST VERSION • +{vm.currentVersion.additions} -{vm.currentVersion.deletions}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={vm.handleReset}
              >
                Clear
              </Button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium mb-2 text-muted-foreground">
                Changes: <span className="text-green-600">+{vm.currentVersion.additions}</span> <span className="text-red-600">-{vm.currentVersion.deletions}</span>
              </div>
              <DiffView
                original={vm.inputText}
                edited={vm.currentVersion.suggestedText}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={vm.handleReset}
              >
                Reject
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (onAcceptEdit && vm.currentVersion) {
                    onAcceptEdit(vm.currentVersion.suggestedText);
                  }
                  vm.handleReset();
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
