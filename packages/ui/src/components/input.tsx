import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const inputVariants = cva(
  "flex h-10 w-full bg-background p-2 text-sm focus:outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-input rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-main-200",
        transparent: "bg-transparent",
      },
      h: {
        default: "h-10",
        sm: "h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      h: "sm",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, h, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, h, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
