"use client";

import { useState } from 'react';

type QuickTagsProps = {
  tags: string[];
};

export function QuickTags({ tags }: QuickTagsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selected.has(tag);
          return (
            <button
              type="button"
              key={tag}
              onClick={() => toggle(tag)}
              data-active={active}
              className={`rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${
                active
                  ? 'border-amber-300 bg-amber-100 text-amber-900 shadow-sm'
                  : 'border-transparent bg-muted text-slate-800 hover:border-amber-200 hover:bg-amber-50'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {[...selected].map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}
    </div>
  );
}
