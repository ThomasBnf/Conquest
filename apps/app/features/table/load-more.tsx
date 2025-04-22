import { Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";

export const LoadMore = ({
  hasNextPage,
  ref,
}: {
  hasNextPage: boolean;
  ref: ForwardedRef<HTMLDivElement>;
}) => {
  if (!hasNextPage) return;

  return (
    <div
      className="absolute flex w-[100vw] items-center justify-center gap-2 py-4 text-muted-foreground"
      ref={ref}
    >
      <Loader2 size={16} className="animate-spin" />
      <p>Loading more...</p>
    </div>
  );
};
