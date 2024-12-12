import { Love } from "@/components/icons/Love";
import { client } from "@/lib/rpc";
import { cn } from "@conquest/ui/src/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  member: Member;
  showIcon?: boolean;
};

export const LoveTooltip = ({ member, showIcon = true }: Props) => {
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

  return (
    <Tooltip>
      <TooltipTrigger
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex items-center justify-end gap-1.5"
      >
        <Love size={18} />
        <p>{member.love}</p>
        {showIcon && <InfoIcon size={13} className="text-muted-foreground" />}
      </TooltipTrigger>
      <TooltipContent align="end">
        <div className="flex w-full flex-col gap-1 text-start">
          {data?.details.map(({ activity_name, activity_count, weight }) => (
            <div
              key={activity_name}
              className="flex items-center justify-between text-sm"
            >
              <p className="w-36">{activity_name}</p>
              <p>
                {activity_count} * {weight} = {activity_count * weight}
              </p>
            </div>
          ))}
          <div
            className={cn(
              "flex items-center justify-between text-sm",
              data?.details.length && "mt-4",
            )}
          >
            <p className="w-36">Love</p>
            <p>{data?.total_love ?? 0}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="w-36">Total Activities</p>
            <p>{data?.total_activities ?? 0}</p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
