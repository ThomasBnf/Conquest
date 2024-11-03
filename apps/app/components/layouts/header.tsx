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
        "flex min-h-12 shrink-0 items-center justify-between px-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-base">{title}</h2>
        {count && (
          <p className="border rounded-lg px-1.5 py-0.5 font-mono actions-secondary">
            {count}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};
