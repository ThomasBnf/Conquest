import { cn } from "@conquest/ui/cn";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center rounded-md justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-main-500 text-primary-foreground hover:bg-main-800 hover:border-main-800",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        dropdown: "bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        transparent: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-6 rounded px-1.5",
        sm: "h-8 rounded px-2",
        lg: "h-11 rounded px-8",
        icon: "h-6 w-6",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ...props }, ref) => {
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
            "flex items-center justify-center gap-2",
            loading && "invisible",
          )}
        >
          {props.children}
        </span>
        {loading && <Loader className="size-4 absolute animate-spin" />}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
