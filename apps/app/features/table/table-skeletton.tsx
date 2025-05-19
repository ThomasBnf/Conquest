import { cn } from "../../../../packages/ui/src/lib/utils";
import { Skeleton } from "@conquest/ui/skeleton";
import { v4 as uuid } from "uuid";

export const TableSkeleton = () => {
  return (
    <div className="flex flex-col divide-y overflow-hidden">
      <div className="h-full overflow-hidden">
        <div className="flex border-b bg-sidebar">
          <div className="flex w-[300px] shrink-0 items-center gap-2 border-r p-2">
            <Skeleton className="size-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex">
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={uuid()}
                className="flex shrink-0 items-center border-r p-2"
                style={{ width: [2, 3].includes(index) ? "200px" : "250px" }}
              >
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 50 }, () => (
          <div key={uuid()} className="flex border-b">
            <div className="flex w-[300px] shrink-0 items-center gap-4 border-r">
              <div className="flex items-center gap-2 p-2">
                <Skeleton className="size-5" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
            <div className="flex">
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={uuid()}
                  className="flex h-11 items-center border-r p-2"
                  style={{ width: [2, 3].includes(index) ? "200px" : "250px" }}
                >
                  <Skeleton
                    className={cn(
                      [2, 3].includes(index) ? "h-[26px] w-28" : "h-5 w-24",
                      [2, 3].includes(index) && "h-[28px] w-28",
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2">
        <Skeleton className="h-[17px] w-28" />
      </div>
    </div>
  );
};
