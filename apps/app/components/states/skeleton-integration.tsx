import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { Separator } from "@conquest/ui/separator";
import { Skeleton } from "@conquest/ui/skeleton";

export const SkeletonIntegration = () => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <Skeleton className="h-6 w-24" />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Skeleton className="size-6" />
        </div>
        <Skeleton className="size-6 w-20" />
      </div>
      <Card>
        <CardHeader className="flex h-14 flex-row items-center">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="mb-0.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1 h-4 w-48" />
          <Separator className="my-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};
