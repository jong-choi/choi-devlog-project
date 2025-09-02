"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AdminPostData } from "@/types/admin";

interface AdminSummaryDialogProps {
  post: AdminPostData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSummaryDialog({
  post,
  isOpen,
  onClose,
}: AdminSummaryDialogProps) {
  if (!post?.ai_summary) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI 요약
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {post.title}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                {post.ai_summary.summary}
              </pre>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              생성일:{" "}
              {new Date(post.ai_summary.created_at).toLocaleString("ko-KR")}
            </p>
            <Button onClick={onClose}>닫기</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
