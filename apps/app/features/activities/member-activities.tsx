"use client";

import { IsLoading } from "@/components/states/is-loading";
import { useIsClient } from "@/hooks/useIsClient";
import { client } from "@/lib/rpc";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import {
  type ActivityWithTypeAndMember,
  ActivityWithTypeAndMemberSchema,
} from "@conquest/zod/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, isYesterday } from "date-fns";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithTypeAndMember[]>;

type Props = React.HTMLAttributes<HTMLDivElement> & {
  member_id?: string;
  initialActivities: ActivityWithTypeAndMember[];
};

export const MemberActivities = ({
  member_id,
  initialActivities,
  className,
}: Props) => {
  const { ref, inView } = useInView();
  const isClient = useIsClient();

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["activities", member_id],
    queryFn: async ({ pageParam }) => {
      const response = await client.api.activities.member[":memberId"].$get({
        param: { memberId: member_id ?? "" },
        query: {
          page: pageParam.toString(),
        },
      });
      return ActivityWithTypeAndMemberSchema.array().parse(
        await response.json(),
      );
    },
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialData: { pages: [initialActivities], pageParams: [1] },
    initialPageParam: 1,
  });

  const activities = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return pages.flatMap((page) => page ?? []);
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

  if (!isClient) return <IsLoading />;

  return (
    <div className={cn("mx-auto max-w-3xl px-8 pt-6 pb-12", className)}>
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
