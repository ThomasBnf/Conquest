"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const toggleVariants = cva(
  "inline-flex items-center rounded-md justify-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border focus-visible:border-main-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-main-400 border border-main-400 text-primary-foreground hover:bg-main-500 hover:border-main-500 actions-primary active:bg-main-600 active:border-main-600",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground actions-secondary",
      },
      size: {
        default: "h-10 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
