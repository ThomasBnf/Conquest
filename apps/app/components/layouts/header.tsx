import { cn } from "@conquest/ui/utils/cn";
import { type ReactNode, forwardRef } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  count?: ReactNode;
};

export const Header = forwardRef<HTMLDivElement, Props>(
  ({ className, title, count, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-12 shrink-0 items-center px-4 border-b",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <p className="font-medium text-base">{title}</p>
        {count && (
          <p className="border rounded-md px-1.5 py-0.5 shadow-sm font-mono">
            {count}
          </p>
        )}
      </div>
      {children}
    </div>
  ),
);
