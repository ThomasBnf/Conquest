import { Skeleton } from "@conquest/ui/skeleton";

export const LoadingChannels = () => {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
};
