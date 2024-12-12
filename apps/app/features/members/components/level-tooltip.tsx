import { Level } from "@/components/icons/Level";
import { getLevelLabel } from "@/helpers/getLevelLabel";
import { getPresenceLabel } from "@/helpers/getPresenceLabel";
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

export const LevelTooltip = ({ member, showIcon = true }: Props) => {
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
        {member.level > 0 && <Level size={18} />}
        <p className={cn(member.level === 0 && "text-muted-foreground")}>
          {getLevelLabel(member.level)}
        </p>
        {showIcon && <InfoIcon size={13} className="text-muted-foreground" />}
      </TooltipTrigger>
      <TooltipContent className="space-y-2 text-start" align="end">
        <div>
          <div className="flex items-center justify-between">
            <p className="w-52">Max Weight Activity</p>
            <p>{data?.max_weight || 0}</p>
          </div>
          <p className="opacity-70">
            {
              data?.details.find((detail) => detail.weight === data?.max_weight)
                ?.activity_name
            }
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="w-52">Presence</p>
            <p>{member?.presence || 0}</p>
          </div>
          <p className="opacity-70">{getPresenceLabel(member?.presence)}</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="w-36">Level</p>
          <p>{member?.level}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
