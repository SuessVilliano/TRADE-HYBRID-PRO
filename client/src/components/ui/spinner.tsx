import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
      },
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-3",
        xl: "h-12 w-12 border-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ className, variant, size, ...props }: SpinnerProps) {
  return (
    <span
      className={cn(spinnerVariants({ variant, size }), className)}
      {...props}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
}