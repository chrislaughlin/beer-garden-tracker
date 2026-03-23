import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-primary', props.className)} {...props} />;
}
