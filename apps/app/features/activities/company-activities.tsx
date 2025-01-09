"use client";

import { listCompanyActivities } from "@/client/activities/listCompanyActivities";
import { Activities as ActivitiesIcon } from "@/components/icons/Activities";
import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { format, isYesterday } from "date-fns";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithTypeAndMember[]>;

type Props = React.HTMLAttributes<HTMLDivElement> & {
  company_id: string;
  initialActivities: ActivityWithTypeAndMember[];
};

export const CompanyActivities = ({
  company_id,
  initialActivities,
  className,
}: Props) => {
  const { ref, inView } = useInView();
  const isClient = useIsClient();

  const { activities, isLoading, fetchNextPage, hasNextPage } =
    listCompanyActivities({
      initialActivities,
      company_id,
    });

  const groupedActivities = useMemo(() => {
    if (!activities?.length) return {};

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

  if (!isClient) return <IsLoading />;

  if (!activities?.length)
    return (
      <EmptyState
        icon={<ActivitiesIcon size={36} />}
        title="No activities found"
        description="This company has no activities"
      />
    );

  return (
    <div className={cn("mx-auto max-w-6xl p-4 py-8", className)}>
      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date} className="mb-10 space-y-14">
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <p className="mx-4 rounded-md border bg-muted p-1 leading-none">
              {isYesterday(date) ? "Yesterday" : format(date, "MMMM d, yyyy")}
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-10">
            {!isLoading &&
              activities.map((activity) => (
                <ActivityParser key={activity.id} activity={activity} />
              ))}
          </div>
        </div>
      ))}
      {!isLoading && <div ref={ref} />}
    </div>
  );
};
