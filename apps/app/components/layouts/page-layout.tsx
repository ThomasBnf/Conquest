import { cn } from "@conquest/ui/cn";
import { type PropsWithChildren, forwardRef } from "react";

type Props = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

export const PageLayout = forwardRef<HTMLDivElement, Props>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-dvh w-full flex-col divide-y overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
