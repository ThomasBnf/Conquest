import { Pulse } from "@/components/icons/Pulse";
import { client } from "@/lib/rpc";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  member: Member;
  showIcon?: boolean;
};

type GroupedActivities = Record<string, Record<string, ActivityWithType[]>>;

export const PulseTooltip = ({ member, showIcon = true }: Props) => {
  const [hover, setHover] = useState(false);

  const { data } = useQuery({
    queryKey: [member.id, "metrics"],
    queryFn: async () => {
      const response = await client.api.members[":memberId"].metrics.$get({
        param: { memberId: member.id },
      });

      return await response.json();
    },
    enabled: !!member.id && hover,
  });

  const groupedActivities = data?.activities?.reduce<GroupedActivities>(
    (acc, activity) => {
      const { source, name } = activity.activity_type;

      const transformedActivity = {
        ...activity,
        created_at: new Date(activity.created_at),
        updated_at: new Date(activity.updated_at),
        activity_type: {
          ...activity.activity_type,
          created_at: new Date(activity.activity_type.created_at),
          updated_at: new Date(activity.activity_type.updated_at),
        },
      };

      acc[source] ??= {};
      acc[source][name] ??= [];
      acc[source][name].push(transformedActivity);
      return acc;
    },
    {},
  );

  const activityMetrics = Object.entries(groupedActivities || {})
    .flatMap(([source, activities]) => {
      return Object.entries(activities).map(([name, items]) => ({
        source,
        name,
        count: items.length,
        weight: items[0]?.activity_type.weight ?? 0,
      }));
    })
    .flat();

  const totalActivities = activityMetrics.reduce(
    (sum, metric) => sum + metric.count,
    0,
  );
  const totalPulse = activityMetrics.reduce(
    (sum, metric) => sum + metric.count * metric.weight,
    0,
  );

  return (
    <Tooltip>
      <TooltipTrigger
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex items-center justify-end gap-1.5"
      >
        <Pulse size={18} />
        <p>{member.pulse}</p>
        {showIcon && <InfoIcon size={13} className="text-muted-foreground" />}
      </TooltipTrigger>
      <TooltipContent align="start" side="right">
        <div className="flex items-center justify-between text-sm">
          <p className="w-36">Pulse</p>
          <p>{totalPulse}</p>
        </div>
        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="w-36">Total Activities</p>
          <p>{totalActivities}</p>
        </div>
        <div className="mb-2 flex items-center justify-between opacity-60">
          <p className="text-xs">Source</p>
          <p className="text-xs">Activities x Weight</p>
        </div>
        <div className="flex w-full flex-col gap-1 text-start">
          {Object.entries(groupedActivities || {}).map(
            ([source, activities]) => (
              <div key={source} className="mb-2">
                <p className="mb-1 text-xs opacity-60">{source}</p>
                {Object.entries(activities).map(([name, items]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-sm"
                  >
                    <p className="w-36">{name}</p>
                    <p className="flex items-baseline gap-1">
                      {items.length} <span>x</span>{" "}
                      {items[0]?.activity_type.weight}
                    </p>
                  </div>
                ))}
              </div>
            ),
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
