import { Skeleton } from "@conquest/ui/skeleton";
import cuid from "cuid";

export const TableSkeleton = () => {
  return (
    <div className="flex flex-col divide-y overflow-hidden">
      <div className="h-full overflow-hidden">
        <div className="flex border-b bg-muted">
          <div className="flex h-11 w-[285px] shrink-0 items-center gap-2 border-r px-3">
            <Skeleton className="size-4 bg-border" />
            <Skeleton className="mx-2 h-4 w-32 bg-border" />
          </div>
          <div className="flex divide-x">
            {Array.from({ length: 6 }, () => (
              <div
                key={cuid()}
                className="flex h-11 w-[250px] shrink-0 items-center px-2"
              >
                <Skeleton className="h-4 w-24 bg-border" />
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 50 }, () => (
          <div key={cuid()} className="flex border-b">
            <div className="flex h-11 w-[285px] shrink-0 items-center gap-4 border-r">
              <div className="flex items-center gap-4 px-3">
                <Skeleton className="size-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            <div className="flex divide-x">
              {Array.from({ length: 6 }, () => (
                <div
                  key={cuid()}
                  className="flex h-11 w-[250px] items-center px-3"
                >
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-[118px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <div className="flex items-center space-x-2">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
      </div>
    </div>
  );
};
