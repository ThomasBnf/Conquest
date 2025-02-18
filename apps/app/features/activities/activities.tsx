import { Activities as ActivitiesIcon } from "@/components/icons/Activities";
import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { IntegrationProvider } from "@/context/integrationContext";
import { useUser } from "@/context/userContext";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { format, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithType[]>;

type Props = {
  activities: ActivityWithType[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  className?: string;
};

export const Activities = ({
  activities,
  hasNextPage,
  fetchNextPage,
  isLoading,
  className,
  children,
}: PropsWithChildren<Props>) => {
  const { slug } = useUser();
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
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  if (isLoading) return <IsLoading />;

  if (!activities?.length)
    return (
      <EmptyState
        icon={<ActivitiesIcon size={36} />}
        title="No activities found"
        description="Connect your integrations to start collecting activities"
      >
        <Link
          href={`/${slug}/settings/integrations`}
          className={cn(buttonVariants())}
        >
          Connect integrations
        </Link>
      </EmptyState>
    );

  return (
    <div className={cn("mx-auto max-w-3xl px-4 pt-6 pb-12", className)}>
      {Object.entries(groupedActivities).map(([date, activities]) => (
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
                <IntegrationProvider key={id} source={source}>
                  <ActivityParser key={id} activity={activity} />
                </IntegrationProvider>
              );
            })}
          </div>
        </div>
      ))}
      {!isLoading && <div ref={ref} />}
    </div>
  );
};
