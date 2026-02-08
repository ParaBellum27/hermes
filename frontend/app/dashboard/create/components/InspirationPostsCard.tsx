"use client";

import { Lightbulb, Heart, MessageCircle, Repeat2, Flame, TrendingDown } from "lucide-react";
import type { ContentPost, Profile } from "@/types";

interface InspirationPostsCardProps {
  posts: ContentPost[];
  creatorProfiles?: Profile[];
}

export function InspirationPostsCard({ posts, creatorProfiles = [] }: InspirationPostsCardProps) {
  if (posts.length === 0) return null;

  const totalWords = posts.reduce((acc, post) => {
    const content = post.text || post.postRaw || "";
    return acc + content.split(/\s+/).filter(Boolean).length;
  }, 0);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Inspiration</h2>
            <p className="text-xs text-gray-400">{posts.length} post{posts.length !== 1 ? 's' : ''} • {totalWords} words</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {posts.map((post) => {
          const postContent = post.text || post.postRaw || "";
          const creator = creatorProfiles.find(c => c.id === post.creatorId);

          // Calculate performance vs average
          const avgReactions = creator?.avgReactions || 0;
          const postReactions = post.stats?.total_reactions || 0;
          const multiplier = avgReactions > 0 ? postReactions / avgReactions : 0;
          const isBanger = multiplier >= 1.5;
          const isMid = multiplier > 0 && multiplier < 0.7;

          return (
            <div
              key={post.id}
              className={`p-4 rounded-xl ${isBanger ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-medium text-gray-500">{post.author}</p>
                {isBanger && (
                  <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    <Flame className="w-3 h-3" />
                    {multiplier.toFixed(1)}x
                  </span>
                )}
                {isMid && (
                  <span className="flex items-center gap-1 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    {multiplier.toFixed(1)}x
                  </span>
                )}
              </div>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm line-clamp-4">
                {postContent || "No content available"}
              </p>
              {/* Stats */}
              {post.stats && (
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                  <div className={`flex items-center gap-1 ${isBanger ? 'text-orange-500' : 'text-gray-400'}`}>
                    <Heart className="w-3 h-3" />
                    <span className="text-xs">{post.stats.total_reactions?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-xs">{post.stats.comments?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Repeat2 className="w-3 h-3" />
                    <span className="text-xs">{post.stats.reposts?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
