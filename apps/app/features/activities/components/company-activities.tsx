"use client";

import { IsLoading } from "@/components/states/is-loading";
import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, isYesterday } from "date-fns";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { _listCompanyActivities } from "../actions/_listCompanyActivities";
import { ActivityParser } from "./activity-parser";

type Activities = Record<string, ActivityWithMember[]>;

type Props = React.HTMLAttributes<HTMLDivElement> & {
  company_id: string;
  initialActivities: ActivityWithMember[];
};

export const CompanyActivities = ({
  company_id,
  initialActivities,
  className,
}: Props) => {
  const { ref, inView } = useInView();
  const isClient = useIsClient();

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["activities", company_id],
    queryFn: async ({ pageParam }) => {
      const rActivities = await _listCompanyActivities({
        page: pageParam,
        company_id,
      });
      return rActivities?.data;
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
    <div className={cn("mx-auto pt-6 pb-12 max-w-3xl", className)}>
      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date} className="space-y-14 mb-10">
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
      {!isLoading && activities?.length > 50 && <div ref={ref} />}
    </div>
  );
};
