import * as React from 'react';
import { cn } from '@/lib/utils';

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-28 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-primary', props.className)} {...props} />;
}
