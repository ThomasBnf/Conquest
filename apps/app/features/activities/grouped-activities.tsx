"use client";

import { IsLoading } from "@/components/states/is-loading";
import { listActivities } from "@/queries/activities/listActivities";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import {
  type ActivityWithContact,
  ActivityWithContactSchema,
} from "@conquest/zod/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, isYesterday } from "date-fns";
import { Fragment, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = {
  [createdAt: string]: ActivityWithContact[];
};

type Props = {
  contact_id?: string;
  className?: string;
};

export const GroupedActivities = ({ contact_id, className }: Props) => {
  const { ref, inView } = useInView();

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["activities", contact_id],
    queryFn: ({ pageParam }) => listActivities({ page: pageParam, contact_id }),
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const activities = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return ActivityWithContactSchema.array().parse(
      pages.flatMap((page) => page?.data ?? []),
    );
  }, [data?.pages]);

  const groupedActivities = useMemo(() => {
    return activities.reduce((acc: Activities, activity) => {
      const createdAt = format(activity.created_at, "PP");
      if (!acc[createdAt]) acc[createdAt] = [];
      acc[createdAt].push(activity);
      return acc;
    }, {});
  }, [activities, data?.pages]);

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage, isLoading]);

  return (
    <div className={cn("mt-4 flex flex-col gap-4", className)}>
      {isLoading ? (
        <IsLoading />
      ) : (
        Object.entries(groupedActivities).map(
          ([date, activities]) =>
            activities.length > 0 && (
              <Fragment key={date}>
                <DateSeparator date={new Date(date)} />
                <div className="flex flex-col gap-4">
                  {activities.map((activity) => (
                    <ActivityParser key={activity.id} activity={activity} />
                  ))}
                </div>
              </Fragment>
            ),
        )
      )}
      {!isLoading && <div ref={ref} />}
    </div>
  );
};

const DateSeparator = ({ date }: { date: Date }) => (
  <div className="my-4 flex items-center">
    <Separator className="flex-1" />
    <p className="mx-4 rounded border bg-muted p-1 leading-none">
      {isYesterday(date) ? "Yesterday" : format(date, "MMMM d, yyyy")}
    </p>
    <Separator className="flex-1" />
  </div>
);
