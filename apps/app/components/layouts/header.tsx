import { cn } from "@conquest/ui/utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
  count?: ReactNode;
};

export const Header = ({ title, count, children, className }: Props) => {
  return (
    <div
      className={cn(
        "flex min-h-12 shrink-0 items-center justify-between px-4 border-b",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-base">{title}</h2>
        {count && (
          <p className="border rounded-md px-1.5 py-0.5 shadow-sm font-mono">
            {count}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};
