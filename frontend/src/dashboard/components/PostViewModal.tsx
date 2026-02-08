/**
 * PostViewModal - Modal dialog for viewing full post content
 * Displays post title, author, timestamp, full content, and link to original post
 */
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PostViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  author: string;
  timeAgo: string;
  content?: string;
  postUrl?: string;
}

export function PostViewModal({
  isOpen,
  onClose,
  title,
  author,
  timeAgo,
  content,
  postUrl,
}: PostViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-xl font-semibold text-[#696969] mb-2">
                {title}
              </DialogTitle>
              <p className="text-sm text-[#696969]">
                {author} • {timeAgo}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {content ? (
            <div className="prose max-w-none">
              <p className="text-[#696969] whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No content available
            </div>
          )}

          {postUrl && (
            <div className="pt-4 border-t border-[#E1E1E1]">
              <a
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#5578C8] hover:underline"
              >
                View original post →
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
