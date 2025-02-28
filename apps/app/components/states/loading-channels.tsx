import { Skeleton } from "@conquest/ui/skeleton";

export const LoadingChannels = () => {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <div>
        <Skeleton className="mb-2 h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-44" />
      </div>
      <Skeleton className="h-8 w-[70px]" />
    </div>
  );
};
