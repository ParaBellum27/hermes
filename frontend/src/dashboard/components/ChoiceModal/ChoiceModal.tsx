"use client";

import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceModalProps {
  isOpen: boolean;
  onUseAsInspiration: (similarity: number) => void;
  onNoCustomNeeded: (similarity: number) => void;
  onClose?: () => void;
}

export function ChoiceModal({
  isOpen,
  onUseAsInspiration,
  onNoCustomNeeded,
  onClose,
}: ChoiceModalProps) {
  const [similarity, setSimilarity] = useState(50); // How similar to original (0-100%)

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={() => onClose?.()}
    >
      <div
        className="w-full max-w-md cursor-default bg-white rounded-3xl border border-gray-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-100 overflow-hidden rounded-t-3xl">
          <div className="relative flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              How would you like to create?
            </h2>
            <p className="text-sm text-gray-600">
              Choose your content generation approach
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Similarity Slider */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              How similar to the original?
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={similarity}
                onChange={(e) => setSimilarity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
              />
              <div className="flex justify-between text-xs">
                <span className={cn("font-medium transition-all", similarity < 30 ? "text-black" : "text-gray-400")}>
                  Very different
                </span>
                <span className={cn("font-medium transition-all", similarity >= 30 && similarity < 70 ? "text-black" : "text-gray-400")}>
                  Moderate
                </span>
                <span className={cn("font-medium transition-all", similarity >= 70 ? "text-black" : "text-gray-400")}>
                  Very similar
                </span>
              </div>
              <div className="text-center">
                <span className="text-lg font-bold text-gray-900">{similarity}% similar</span>
              </div>
            </div>
          </div>

          {/* Use as Inspiration */}
          <button
            onClick={() => onUseAsInspiration(similarity)}
            className="w-full group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 rounded-2xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Use as inspiration
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customize how different it is from the original and add your personal context
                  </p>
                </div>
              </div>
            </div>
          </button>

          {/* No Custom Needed */}
          <button
            onClick={() => onNoCustomNeeded(similarity)}
            className="w-full group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    No custom needed
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generate immediately with default settings - quick and simple
                  </p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onClose?.()}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
