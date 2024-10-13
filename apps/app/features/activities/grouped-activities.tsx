import { cn } from "@conquest/ui/utils/cn";
import { Separator } from "@conquest/ui/separator";
import { format, isYesterday } from "date-fns";
import { Fragment, type HTMLAttributes } from "react";
import type { ActivityWithContact } from "schemas/activity.schema";
import { CustomActivity } from "./custom-activity";
import { LoadMore } from "./load-more";

type Activities = {
  [createdAt: string]: ActivityWithContact[];
};

type Props = HTMLAttributes<HTMLDivElement> & {
  activities: ActivityWithContact[] | undefined;
};

export const GroupedActivities = ({ activities, className }: Props) => {
  const groupedActivities =
    activities?.reduce((acc: Activities, activity) => {
      const createdAt = format(activity.created_at, "yyyy-MM-dd");

      if (!acc[createdAt]) acc[createdAt] = [];
      acc[createdAt].push(activity);

      return acc;
    }, {}) ?? {};

  return (
    <div className={cn("mt-4 flex flex-col gap-4", className)}>
      {Object.entries(groupedActivities).map(
        ([date, activities]) =>
          activities.length > 0 && (
            <Fragment key={date}>
              <DateSeparator date={new Date(date)} />
              <div className="flex flex-col gap-4">
                {activities.map((activity) => (
                  <CustomActivity key={activity.id} activity={activity} />
                ))}
                <LoadMore />
              </div>
            </Fragment>
          ),
      )}
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
