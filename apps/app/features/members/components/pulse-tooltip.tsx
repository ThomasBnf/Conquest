import { Pulse } from "@/components/icons/Pulse";
import { client } from "@/lib/rpc";
import { cn } from "@conquest/ui/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  member: Member;
  showIcon?: boolean;
};

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

  const groupedActivities = data?.details.reduce<
    Array<{
      source: string;
      activities: Array<{ name: string; count: number }>;
    }>
  >((acc, activity) => {
    const sourceGroup = acc.find((group) => group.source === activity.source);

    if (!sourceGroup) {
      acc.push({
        source: activity.source,
        activities: [
          {
            name: activity.activity_name,
            count: activity.activity_count,
          },
        ],
      });
      return acc;
    }

    const existingActivity = sourceGroup.activities.find(
      (a) => a.name === activity.activity_name,
    );

    if (existingActivity) {
      existingActivity.count += activity.activity_count;
    } else {
      sourceGroup.activities.push({
        name: activity.activity_name,
        count: activity.activity_count,
      });
    }

    return acc;
  }, []);

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
      <TooltipContent align="end">
        <div
          className={cn(
            "flex items-center justify-between text-sm",
            data?.details.length && "mb-1",
          )}
        >
          <p className="w-36">Pulse</p>
          <p>{data?.total_pulse ?? 0}</p>
        </div>
        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="w-36">Total Activities</p>
          <p>{data?.total_activities ?? 0}</p>
        </div>
        <div className="flex w-full flex-col gap-1 text-start">
          {groupedActivities?.map((group) => (
            <div key={group.source} className="mb-2">
              <p className="mb-1 text-xs opacity-60">{group.source}</p>
              {group.activities.map((activity) => (
                <div
                  key={activity.name}
                  className="flex items-center justify-between text-sm"
                >
                  <p className="w-36">{activity.name}</p>
                  <p>{activity.count}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
