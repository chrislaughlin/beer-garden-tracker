import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:opacity-50 min-h-11 px-5', {
  variants: {
    variant: {
      default: 'bg-primary text-white shadow-soft hover:brightness-95',
      secondary: 'bg-secondary text-white hover:bg-secondary/90',
      ghost: 'bg-white/70 text-foreground hover:bg-white',
      outline: 'border border-border bg-card hover:bg-muted'
    },
    size: {
      default: 'h-11',
      sm: 'h-9 px-4 text-xs',
      lg: 'h-12 px-6 text-base'
    }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
