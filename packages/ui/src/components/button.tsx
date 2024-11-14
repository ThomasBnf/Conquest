import { cn } from "@conquest/ui/cn";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center rounded-md justify-center text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-main-500 border border-main-500 text-primary-foreground hover:bg-main-700 hover:border-main-700 actions-primary active:bg-main-900 active:border-main-900",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive hover:bg-destructive/90 hover:border-destructive actions-primary active:bg-red-600 active:border-desctructive",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground actions-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "hover:bg-secondary hover:text-accent-foreground",
        dropdown: "bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        transparent: "",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-2",
        xs: "h-6 px-1.5",
        icon: "h-6 w-6",
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
  loading?: boolean;
  classNameSpan?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      classNameSpan,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "relative",
          loading && "cursor-not-allowed",
          buttonVariants({ variant, size, className }),
        )}
        disabled={loading}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "flex items-center justify-center w-full gap-1.5",
            loading && "invisible",
            classNameSpan,
          )}
        >
          {props.children}
        </span>
        {loading && <Loader2 className="size-4 absolute animate-spin" />}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
