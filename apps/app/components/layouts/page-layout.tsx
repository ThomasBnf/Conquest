import { cn } from "@conquest/ui/utils/cn";
import { type PropsWithChildren, forwardRef } from "react";

type Props = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

export const PageLayout = forwardRef<HTMLDivElement, Props>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col h-dvh overflow-hidden divide-y", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
