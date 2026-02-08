/**
 * InspiredByContent - Main content area displaying highlighted posts for inspiration
 * Shows selected posts from the feed that users have highlighted to inspire their content creation
 */
import type { ContentPost } from "@/types";

interface InspiredByContentProps {
  highlightedPosts: ContentPost[];
}

export function InspiredByContent({ highlightedPosts }: InspiredByContentProps) {
  return (
    <div className="bg-[#FFFEFE] rounded-md border border-[#E1E1E1] p-4 min-h-[600px]">
      <div className="mb-4">
        <p className="text-xs font-semibold leading-none text-[#696969] uppercase tracking-wide">
          INSPIRED BY •{" "}
          {highlightedPosts.length > 0 ? (
            <span className="font-normal">
              {highlightedPosts.map((p) => p.title).join(" • ")}
            </span>
          ) : (
            <span className="font-normal">
              Select posts to inspire your content
            </span>
          )}
        </p>
      </div>

      {highlightedPosts.length > 0 ? (
        <div className="space-y-6">
          {highlightedPosts.map((post) => (
            <div
              key={post.id}
              className="pb-6 border-b border-[#E1E1E1] last:border-b-0"
            >
              <p className="text-[#696969] whitespace-pre-wrap leading-relaxed">
                {post.postRaw || "No content available"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 text-[#696969]">
          Select posts from the feed to see inspiration
        </div>
      )}
    </div>
  );
}
