import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md justify-center text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-main-400 border border-main-500 text-primary-foreground hover:bg-main-500 active:bg-main-600",
        destructive:
          "bg-destructive border border-red-600 text-destructive-foreground hover:bg-red-600 active:bg-red-700",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm shadow-black/5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "hover:bg-muted-hover hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "bg-background/15 hover:bg-background/20 border-foreground/10 actions-secondary",
        transparent: "",
      },
      size: {
        default: "h-10 px-4",
        lg: "h-12 px-4 text-base",
        md: "h-10 px-4",
        sm: "h-8 px-2",
        xs: "h-6 px-1.5",
        icon: "size-8",
        icon_sm: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          props.disabled && "opacity-50",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
