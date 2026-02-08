"use client";

import { useState, useMemo } from "react";
import type { Profile } from "@/types";
import { useCreatePostViewModel } from "../create/createPostViewModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "../components/CreatorProfiles/ProfileCard";

const CREATOR_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended order" },
  { value: "recent", label: "Recently followed" },
  { value: "posts", label: "Most posts" },
  { value: "reactions", label: "Highest reactions" },
  { value: "name", label: "Name A-Z" },
] as const;

type SortOption = typeof CREATOR_SORT_OPTIONS[number]["value"];

function sortCreatorProfiles(profiles: Profile[], sortType: SortOption) {
  if (sortType === "recommended") {
    return profiles;
  }

  const sorted = [...profiles];

  switch (sortType) {
    case "recent":
      return sorted.sort((a, b) => {
        const aTime = a.followedAt ? new Date(a.followedAt).getTime() : 0;
        const bTime = b.followedAt ? new Date(b.followedAt).getTime() : 0;
        return bTime - aTime;
      });
    case "posts":
      return sorted.sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0));
    case "reactions":
      return sorted.sort((a, b) => (b.avgReactions ?? 0) - (a.avgReactions ?? 0));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return profiles;
  }
}

export default function CreatorsPage() {
  const {
    creatorProfiles,
    pendingCreatorIds,
    followCreator,
    unfollowCreator,
  } = useCreatePostViewModel();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "following" | "discover">("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  // Filter profiles based on search and filter type
  const filteredProfiles = useMemo(() => {
    let filtered = creatorProfiles;

    // Apply follow filter
    if (filterType === "following") {
      filtered = filtered.filter(p => p.isFollowed);
    } else if (filterType === "discover") {
      filtered = filtered.filter(p => !p.isFollowed);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return sortCreatorProfiles(filtered, sortBy);
  }, [creatorProfiles, searchQuery, filterType, sortBy]);

  const followingCount = creatorProfiles.filter(p => p.isFollowed).length;
  const discoverCount = creatorProfiles.filter(p => !p.isFollowed).length;

  return (
    <div className="min-h-screen bg-grid" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creators</h1>
          <p className="text-gray-500">Follow creators to see their content in your feed</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 w-full">
              <Input
                value={searchQuery}
                placeholder="Search creators..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setFilterType("all")}
                  variant={filterType === "all" ? "default" : "ghost"}
                  size="sm"
                >
                  All ({creatorProfiles.length})
                </Button>
                <Button
                  onClick={() => setFilterType("following")}
                  variant={filterType === "following" ? "default" : "ghost"}
                  size="sm"
                >
                  Following ({followingCount})
                </Button>
                <Button
                  onClick={() => setFilterType("discover")}
                  variant={filterType === "discover" ? "default" : "ghost"}
                  size="sm"
                >
                  Discover ({discoverCount})
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <label htmlFor="creator-sort" className="whitespace-nowrap">Sort by</label>
                <select
                  id="creator-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="min-w-[170px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {CREATOR_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredProfiles.length} {filteredProfiles.length === 1 ? 'creator' : 'creators'}
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => {
            const isFollowed = profile.isFollowed;
            const isPending = pendingCreatorIds?.has(profile.id) ?? false;

            function handleClick() {
              if (isPending) return;
              if (isFollowed) {
                unfollowCreator?.(profile.id);
              } else {
                followCreator?.(profile.id);
              }
            }

            const label = isPending ? "..." : isFollowed ? "Unfollow" : "Follow";

            return (
              <ProfileCard
                key={profile.id}
                name={profile.name}
                connections={profile.connections}
                postCount={profile.postCount}
                avgReactions={profile.avgReactions}
                avgComments={profile.avgComments}
                avgReposts={profile.avgReposts}
                action={
                  <Button
                    onClick={handleClick}
                    disabled={isPending}
                    variant={isFollowed ? "outline" : "default"}
                    size="sm"
                    aria-label={isFollowed ? "Unfollow creator" : "Follow creator"}
                    aria-pressed={isFollowed}
                  >
                    {label}
                  </Button>
                }
              />
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-gray-400 text-lg">No creators found</p>
            <p className="text-gray-300 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
