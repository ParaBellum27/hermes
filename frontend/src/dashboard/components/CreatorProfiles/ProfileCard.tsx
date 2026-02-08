/**
 * ProfileCard - Renders an individual profile card
 * Used to display creator profiles in various sections of the dashboard
 */
import type { ReactNode } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

interface ProfileCardProps {
  name: string;
  connections: string;
  postCount?: number;
  avgReactions?: number;
  avgComments?: number;
  avgReposts?: number;
  action?: ReactNode;
}

export function ProfileCard({
  name,
  connections,
  postCount,
  avgReactions,
  avgComments,
  avgReposts,
  action,
}: ProfileCardProps) {
  const hasStats =
    avgReactions !== undefined && avgComments !== undefined && avgReposts !== undefined;
  const postSummary = postCount !== undefined ? `${postCount} post${postCount === 1 ? "" : "s"}` : connections;

  return (
    <div className="group relative flex w-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600">
              <Image
                src="/Linkedin_icon.png"
                alt="LinkedIn"
                width={14}
                height={14}
                className="flex-shrink-0"
              />
              LinkedIn
            </span>
            <span className="rounded-full bg-gray-50 px-2 py-1 text-gray-500">{postSummary}</span>
          </div>
        </div>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-gray-500">
        {hasStats ? (
          <>
            <div className="flex items-center gap-1 text-sm text-gray-500" title="Avg reactions">
              <Heart className="h-3.5 w-3.5" />
              <span>{avgReactions?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500" title="Avg comments">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{avgComments?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500" title="Avg reposts">
              <Repeat2 className="h-3.5 w-3.5" />
              <span>{avgReposts?.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-400">Engagement data coming soon</span>
        )}
      </div>
    </div>
  );
}
