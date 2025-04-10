import { Skeleton } from "@conquest/ui/skeleton";

export const LoadingRepositories = () => {
  return (
    <div className="mt-2 flex flex-col gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="relative space-y-1 rounded-md border p-4">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-5 w-96" />
          <Skeleton className="absolute top-4 right-4 size-4 rounded-full" />
        </div>
      ))}
    </div>
  );
};
