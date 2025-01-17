"use client";

import { listActivities } from "@/client/activities/listActivities";
import { Activities as ActivitiesIcon } from "@/components/icons/Activities";
import { EmptyState } from "@/components/states/empty-state";
import { IsLoading } from "@/components/states/is-loading";
import { useUser } from "@/context/userContext";
import { useIsClient } from "@/hooks/useIsClient";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { format, isYesterday } from "date-fns";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithTypeAndMember[]>;

type Props = {
  initialActivities: ActivityWithTypeAndMember[];
  className?: string;
};

export const Activities = ({ initialActivities, className }: Props) => {
  const { slug } = useUser();
  const { ref, inView } = useInView();
  const isClient = useIsClient();

  const { activities, isLoading, fetchNextPage, hasNextPage } = listActivities({
    initialActivities,
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
    <div className={cn("mx-auto max-w-3xl pt-6 pb-12", className)}>
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
            {activities.map((activity) => (
              <ActivityParser key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
      {!isLoading && <div ref={ref} />}
    </div>
  );
};
