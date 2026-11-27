import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D3DDD6] bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#F2F6F3] text-[#14532D]">
        <Inbox className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#1C2520]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#4A5950]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F4022] transition-colors whitespace-nowrap shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
