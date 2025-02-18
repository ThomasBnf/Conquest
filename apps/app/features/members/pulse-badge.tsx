import { Pulse } from "@/components/icons/Pulse";
import { getPulseScoreDetails } from "@/helpers/getPulseScoreDetails";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { endOfHour, startOfDay, subDays, subHours } from "date-fns";
import { Hash, InfoIcon } from "lucide-react";

type Props = {
  member: Member;
  showIcon?: boolean;
  isBadge?: boolean;
};

export const PulseBadge = ({
  member,
  showIcon = true,
  isBadge = true,
}: Props) => {
  const { pulse } = member ?? {};

  const { data: levels } = trpc.levels.getAllLevels.useQuery();
  const level = levels?.find((level) => level.id === member?.level_id);
  const { from, to } = level ?? {};

  const { data: channels } = trpc.channels.getAllChannels.useQuery({});
  const { data: activities } = trpc.activities.getMemberActivities.useQuery({
    memberId: member?.id ?? null,
  });

  const today = new Date();
  const filteredActivities = activities?.filter(
    (activity) =>
      activity.created_at >= startOfDay(subDays(today, 90)) &&
      activity.created_at <= endOfHour(subHours(today, 1)),
  );

  const pulseScore = getPulseScoreDetails({
    activities: filteredActivities,
    channels,
  });

  const ToolTip = (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "flex items-center justify-end gap-1.5",
          pulse === 0 && "cursor-default",
        )}
      >
        <Pulse size={18} />
        <p>{pulse}</p>
        {showIcon && pulse > 0 && (
          <InfoIcon size={13} className="text-muted-foreground" />
        )}
      </TooltipTrigger>
      {pulse > 0 && (
        <TooltipContent
          align="start"
          side="right"
          sideOffset={12}
          alignOffset={-2}
        >
          <div className="flex w-full flex-col gap-3 text-start">
            <div>
              <p>Current Level condition</p>
              <p className="text-muted/70">
                From {from} pts to {to} pts
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p>Total activities</p>
              <p>{filteredActivities?.length}</p>
            </div>
            {Object.entries(pulseScore).map(([source, activities]) => (
              <div key={source} className="mt-2">
                <p className="mb-2 font-medium">{source}</p>
                {Object.entries(activities).map(([name, activity]) => (
                  <div key={name} className="mb-2">
                    <p className="first-letter:capitalize">{name}</p>
                    <div className="text-muted/70">
                      {activity.count > 0 && (
                        <div className="flex items-center justify-between gap-6">
                          <p>In any channel</p>
                          <p className="flex items-baseline gap-1 text-white">
                            {activity.count} <span>x</span> {activity.points}{" "}
                            pts
                          </p>
                        </div>
                      )}
                      {Object.entries(activity.conditions ?? {}).map(
                        ([name, condition]) => (
                          <div
                            key={name}
                            className="flex items-center justify-between gap-6"
                          >
                            <p className="flex items-center">
                              In
                              <Hash size={16} className="ml-1" />
                              <span>{name}</span>
                            </p>
                            <p className="flex items-baseline gap-1 text-white">
                              {condition.count} <span>x</span>{" "}
                              {condition.points} pts
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );

  if (isBadge) return <Badge variant="secondary">{ToolTip}</Badge>;
  return ToolTip;
};
