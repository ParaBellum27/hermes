"use client";

import { CircularCountdown } from "@/app/dashboard/components/shared/CircularCountdown";
import { Mic, MicOff, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAssistantPanelProps {
  isAiActive: boolean;
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  silenceCountdown: number | null;
  isGenerating: boolean;
  canGenerate: boolean;
  generateEdit: () => void;
  versionHistoryCount: number;
  onClearAll: () => void;
}

export function AIAssistantPanel({
  isAiActive,
  isVoiceMode,
  toggleVoiceMode,
  isListening,
  startListening,
  stopListening,
  feedbackText,
  setFeedbackText,
  silenceCountdown,
  isGenerating,
  canGenerate,
  generateEdit,
  versionHistoryCount,
  onClearAll,
}: AIAssistantPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-400">{isAiActive ? "Working..." : "Ready to help"}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-5 space-y-5">
        {/* Voice Mode Toggle */}
        <div
          onClick={toggleVoiceMode}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-gray-700">Voice Mode</p>
            <p className="text-xs text-gray-400">Speak your edits</p>
          </div>
          <div
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
              isVoiceMode
                ? "bg-gray-900"
                : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                isVoiceMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </div>
        </div>

        {/* Feedback Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">What would you like to change?</label>
              {silenceCountdown !== null && (
                <CircularCountdown countdown={silenceCountdown} maxTime={3.0} />
              )}
            </div>
            {isVoiceMode && (
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isGenerating}
                variant={isListening ? "destructive" : "default"}
                size="icon"
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
          </div>
          <textarea
            placeholder={isVoiceMode ? "Click the mic to speak..." : "e.g., Make it more professional, shorter, add emojis..."}
            value={isListening ? "Listening..." : feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            disabled={isListening}
            className="w-full min-h-[100px] text-sm text-gray-700 bg-gray-50 border-0 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white leading-relaxed disabled:opacity-50 placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={generateEdit}
            disabled={!canGenerate || isGenerating}
            className="flex-1"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Editing..." : "Edit Content"}
          </Button>
          {versionHistoryCount > 0 && (
            <Button
              onClick={onClearAll}
              variant="ghost"
              size="icon"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
