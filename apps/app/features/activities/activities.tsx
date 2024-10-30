"use client";

import { IsLoading } from "@/components/states/is-loading";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import {
  type ActivityWithMember,
  ActivityWithMemberSchema,
} from "@conquest/zod/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, isYesterday } from "date-fns";
import ky from "ky";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithMember[]>;

type Props = React.HTMLAttributes<HTMLDivElement> & {
  member_id?: string;
};

export const Activities = ({ member_id, className }: Props) => {
  const { ref, inView } = useInView();

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["activities", member_id],
    queryFn: async ({ pageParam }) =>
      await ky
        .get("/api/activities", {
          searchParams: {
            page: pageParam,
          },
        })
        .json<ActivityWithMember[]>(),

    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const activities = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];

    return ActivityWithMemberSchema.array().parse(pages.flat());
  }, [data?.pages]);

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

  if (isLoading || !activities) return <IsLoading />;

  return (
    <div className={cn("mx-auto max-w-3xl pt-6 pb-12", className)}>
      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date} className="space-y-14 mb-10">
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <p className="mx-4 rounded border bg-muted p-1 leading-none">
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
