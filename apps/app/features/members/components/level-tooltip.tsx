import { getLevelLabel } from "@/helpers/getLevelLabel";
import { client } from "@/lib/rpc";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@conquest/ui/src/components/tooltip";
import { cn } from "@conquest/ui/src/utils/cn";
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
        className={cn(
          "flex h-full w-full items-center justify-end gap-1",
          showIcon && "gap-2 px-2",
        )}
      >
        <p>{getLevelLabel(member.level)}</p>
        {showIcon && <InfoIcon size={13} className="text-muted-foreground" />}
      </TooltipTrigger>
      <TooltipContent className="text-start" align="end">
        <div className="flex items-center justify-between text-sm">
          <p className="w-36">Max Weight Activity</p>
          <p>{data?.max_weight || 0}</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <p className="w-36">Presence</p>
          <p>{member?.presence || 0}</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="w-36">Level</p>
          <p>{member?.level}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
