import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { IntegrationProvider } from "@/context/integrationContext";
import { cn } from "@conquest/ui/cn";
import { Activities as ActivitiesIcon } from "@conquest/ui/icons/Activities";
import { Separator } from "@conquest/ui/separator";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithType[]>;

type Props = {
  activities: ActivityWithType[] | undefined;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isLoading: boolean;
  type: "member" | "company";
  className?: string;
};

export const Activities = ({
  activities,
  fetchNextPage,
  hasNextPage,
  isLoading,
  type,
  className,
}: Props) => {
  const { ref, inView } = useInView();

  const groupedActivities = useMemo(() => {
    if (!activities) return {};

    return activities?.reduce((acc: Activities, activity) => {
      const createdAt = format(activity.created_at, "PP");
      if (!acc[createdAt]) acc[createdAt] = [];
      acc[createdAt].push(activity);
      return acc;
    }, {});
  }, [activities]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <IsLoading />;

  if (!activities?.length)
    return (
      <EmptyState
        icon={<ActivitiesIcon size={36} />}
        title="No activities found"
        description={`This ${type} has not yet done any activities.`}
      />
    );

  return (
    <div className={cn("mx-auto w-full max-w-3xl px-4 pt-6 pb-12", className)}>
      {Object.entries(groupedActivities).map(([date, activities], index) => (
        <div key={date} className="mb-10 space-y-14">
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <p className="rounded-md border bg-white p-1.5 leading-none">
              {isToday(date)
                ? "Today"
                : isYesterday(date)
                  ? "Yesterday"
                  : format(date, "MMMM d, yyyy")}
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-4">
            {activities.map((activity) => {
              const { id, activity_type } = activity;
              const { source } = activity_type;

              return (
                <IntegrationProvider key={id} source={source} loader={false}>
                  <ActivityParser key={id} activity={activity} />
                </IntegrationProvider>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={ref} />
    </div>
  );
};
