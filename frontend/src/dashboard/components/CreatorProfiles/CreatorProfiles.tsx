/**
 * CreatorProfiles - Displays a list of creator profiles with follow controls.
 * Shows profile cards with names, platforms, and buttons to follow or unfollow.
 */
import { ProfileCard } from "./ProfileCard";
import { CardTitle } from "../shared/CardTitle";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

interface CreatorProfilesProps {
  profiles: Profile[];
  profileCount?: number;
  onFollow?: (creatorId: number) => void;
  onUnfollow?: (creatorId: number) => void;
  pendingCreatorIds?: Set<number>;
}

export function CreatorProfiles({
  profiles,
  profileCount = 30,
  onFollow,
  onUnfollow,
  pendingCreatorIds,
}: CreatorProfilesProps) {
  // Sort profiles: unfollowed first, then followed by most recent follow time
  const sortedProfiles = [...profiles].sort((a, b) => {
    // Both unfollowed or both followed - sort by follow time
    if (a.isFollowed === b.isFollowed) {
      // If both followed, sort by most recent follow time first
      if (a.isFollowed && a.followedAt && b.followedAt) {
        return new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime();
      }
      return 0;
    }
    // Unfollowed before followed
    return a.isFollowed ? 1 : -1;
  });

  return (
    <section className="flex w-[378px] flex-col items-start gap-3 rounded-md border border-[#E1E1E1] bg-white p-4">
      <CardTitle title="CREATOR PROFILES" subtitle={`${profileCount} profiles`} />
      <div className="flex w-full flex-col space-y-2">
        {sortedProfiles.map((profile) => {
          const isFollowed = profile.isFollowed;
          const isPending = pendingCreatorIds?.has(profile.id) ?? false;

          function handleClick() {
            if (isPending) return;
            if (isFollowed) {
              onUnfollow?.(profile.id);
            } else {
              onFollow?.(profile.id);
            }
          }

          const label = isPending ? "..." : isFollowed ? "Unfollow" : "Follow";

          return (
            <ProfileCard
              key={profile.id}
              name={profile.name}
              connections={profile.connections}
              action={
                onFollow || onUnfollow ? (
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
                ) : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}
