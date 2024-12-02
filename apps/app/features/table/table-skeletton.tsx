import { Skeleton } from "@conquest/ui/src/components/skeleton";
import { cn } from "@conquest/ui/src/utils/cn";
import cuid from "cuid";

export const TableSkeleton = () => {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 50 }, () => (
        <div key={cuid()} className="flex border-b">
          <div className="flex w-[325px] shrink-0 items-center gap-4 border-r bg-background px-3">
            <Skeleton className="size-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-6" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex divide-x">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={cuid()}
                className={cn(
                  "flex h-12 w-[250px] items-center px-3",
                  index === 2 && "w-[150px] justify-end",
                  index === 3 && "w-[150px] justify-end",
                )}
              >
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
