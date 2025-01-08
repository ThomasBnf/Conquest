import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border h-6 gap-2 px-1.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border bg-muted-hover text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-red-100 border rounded-md border-red-200 text-red-700",
        success:
          "bg-green-100 border rounded-md border-green-200 text-green-700",
        outline: "text-foreground bg-background",
        transparent: "border-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
