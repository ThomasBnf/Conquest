import { cn } from "@conquest/ui/cn";
import { Skeleton } from "@conquest/ui/skeleton";
import cuid from "cuid";

export const TableSkeleton = () => {
  return (
    <div className="overflow-hidden">
      <div className="flex border-b bg-muted">
        <div className="flex h-12 w-[325px] shrink-0 items-center border-r">
          <div className="flex w-10 items-center justify-center">
            <Skeleton className="size-4 bg-border" />
          </div>
          <Skeleton className="mx-2 h-4 w-32 bg-border" />
        </div>
        <div className="flex divide-x">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={cuid()}
              className={cn(
                "flex h-12 w-[250px] items-center px-2",
                index === 3 && "w-[200px] justify-end",
                index === 4 && "w-[200px] justify-end",
              )}
            >
              <Skeleton className="h-4 w-24 bg-border" />
            </div>
          ))}
        </div>
      </div>
      {Array.from({ length: 50 }, () => (
        <div key={cuid()} className="flex border-b">
          <div className="flex w-[325px] shrink-0 items-center gap-4 border-r">
            <div className="flex items-center gap-2">
              <div className="flex w-10 items-center justify-center">
                <Skeleton className="size-4" />
              </div>
              <Skeleton className="size-6" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex divide-x">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={cuid()}
                className={cn(
                  "flex h-[42.5px] w-[250px] items-center px-2",
                  index === 3 && "w-[200px] justify-end",
                  index === 4 && "w-[200px] justify-end",
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
