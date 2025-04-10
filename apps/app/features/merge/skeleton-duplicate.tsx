import { Button } from "@conquest/ui/button";
import { Skeleton } from "@conquest/ui/skeleton";

export const SkeletonDuplicate = () => {
  return (
    <div className="divide-y overflow-hidden rounded-md border">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-96 w-80" />
          <Skeleton className="h-96 w-80" />
          <Skeleton className="h-96 w-80" />
        </div>
        <Skeleton className="h-96 w-80" />
      </div>
      <div className="flex items-center justify-end gap-2 bg-sidebar p-2">
        <Button variant="outline" onClick={() => {}} disabled={false}>
          Ignore
        </Button>
        <Button onClick={() => {}} disabled={false}>
          Merge
        </Button>
      </div>
    </div>
  );
};
