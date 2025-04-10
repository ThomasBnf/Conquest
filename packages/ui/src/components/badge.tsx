import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center w-fit rounded-md h-6 gap-2 px-1.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border border-main-500 bg-main-400 text-background",
        secondary: "border bg-background text-foreground",
        destructive: "border bg-red-100 border-red-200 text-red-700",
        success: "border bg-green-100 border-green-200 text-green-700",
        info: "border bg-blue-100 border-blue-200 text-blue-700",
        transparent: "p-0",
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
