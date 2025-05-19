import { cn } from "../../../../packages/ui/src/lib/utils";
import { type PropsWithChildren, forwardRef } from "react";

type Props = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

export const PageLayout = forwardRef<HTMLDivElement, Props>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-dvh w-full flex-col divide-y", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
