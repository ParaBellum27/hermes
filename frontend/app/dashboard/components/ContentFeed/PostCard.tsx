import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sparkles, Check, Flame, TrendingDown, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostStats } from "@/types";

interface PostCardProps {
  title: string;
  author: string;
  timeAgo: string;
  isHighlighted?: boolean;
  onToggle?: () => void;
  onExpand?: () => void;
  stats?: PostStats;
  avgReactions?: number;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function PostCard({
  title,
  author,
  timeAgo,
  isHighlighted = false,
  onToggle,
  onExpand,
  stats,
  avgReactions = 0
}: PostCardProps) {
  // Calculate performance vs average
  const postReactions = stats?.total_reactions || 0;
  const multiplier = avgReactions > 0 ? postReactions / avgReactions : 0;
  const isBanger = multiplier >= 1.5;
  const isMid = multiplier > 0 && multiplier < 0.7;

  return (
    <div
      onClick={onExpand}
      className={cn(
        "relative flex flex-col w-full gap-3 rounded-2xl px-4 py-4 transition-all duration-300 group overflow-hidden cursor-pointer hover:shadow-md",
        isBanger
          ? "border border-orange-200 bg-orange-50/30"
          : "border border-gray-100 bg-white"
      )}
    >
      {/* Header Row */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* LinkedIn Icon */}
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Image
              src="/Linkedin_icon.png"
              alt="LinkedIn"
              width={20}
              height={20}
            />
          </div>

          {/* Author */}
          <span className="text-sm font-semibold text-gray-800">
            {author}
          </span>

          {/* Performance badge */}
          {isBanger && (
            <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
              <Flame className="w-3 h-3" />
              {multiplier.toFixed(1)}x
            </span>
          )}
          {isMid && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" />
              {multiplier.toFixed(1)}x
            </span>
          )}
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400 font-medium">
          {timeAgo}
        </span>
      </div>

      {/* Content */}
      <p className="relative text-sm text-gray-500 leading-relaxed">
        {truncateText(title, 120)}
      </p>

      {/* Stats Row */}
      {stats && (
        <div className="relative flex items-center gap-3">
          <div className={`flex items-center gap-1 ${isBanger ? 'text-orange-500' : 'text-gray-400'}`}>
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs">{stats.total_reactions?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-xs">{stats.comments?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Repeat2 className="w-3.5 h-3.5" />
            <span className="text-xs">{stats.reposts?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Action Row */}
      {onToggle && (
        <div className="relative flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            variant={isHighlighted ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${!isHighlighted ? "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900" : ""}`}
          >
            {isHighlighted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Selected
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Use as Inspo
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
