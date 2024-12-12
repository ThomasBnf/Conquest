import { Skeleton } from "@conquest/ui/skeleton";
import { cn } from "@conquest/ui/src/utils/cn";
import cuid from "cuid";

type Props = {
  isMembers?: boolean;
  isLeaderboard?: boolean;
};

export const TableSkeleton = ({
  isMembers = false,
  isLeaderboard = false,
}: Props) => {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 50 }, () => (
        <div key={cuid()} className="flex border-b">
          <div
            className={cn(
              "flex shrink-0 items-center gap-4 border-r bg-background px-3",
              isLeaderboard ? "w-[285px]" : "w-[325px]",
            )}
          >
            {!isLeaderboard && <Skeleton className="size-4" />}
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
                  (isMembers || isLeaderboard) &&
                    index === 2 &&
                    "w-[185px] justify-end",
                  (isMembers || isLeaderboard) &&
                    index === 3 &&
                    "w-[185px] justify-end",
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
