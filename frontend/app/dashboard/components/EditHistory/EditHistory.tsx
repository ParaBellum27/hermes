"use client";

import { cn } from "@/lib/utils";
import { History, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Version {
  suggestedText: string;
  additions: number;
  deletions: number;
  timestamp: number;
}

interface EditHistoryProps {
  versionHistory: Version[];
  onCopyVersion: (text: string) => void;
  className?: string;
}

export function EditHistory({ versionHistory, onCopyVersion, className }: EditHistoryProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (versionHistory.length <= 1) {
    return null;
  }

  const handleCopy = (text: string, index: number) => {
    onCopyVersion(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={cn("bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <History className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit History</h2>
            <p className="text-xs text-gray-400">{versionHistory.length} versions</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {versionHistory.map((version, index) => (
          <div
            key={version.timestamp}
            className="group relative p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white rounded-lg">
                  v{index + 1}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-medium">+{version.additions}</span>
                  <span className="text-red-400 font-medium">-{version.deletions}</span>
                </div>
                <button
                  onClick={() => handleCopy(version.suggestedText, index)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {version.suggestedText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
