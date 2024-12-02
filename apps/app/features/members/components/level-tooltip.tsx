import { getLevelLabel } from "@/helpers/getLevelLabel";
import { client } from "@/lib/rpc";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/src/components/tooltip";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";

type Props = {
  member: Member;
};

export const LevelTooltip = ({ member }: Props) => {
  const { data } = useQuery({
    queryKey: [member.id, "metrics"],
    queryFn: async () => {
      const response = await client.api.members[":memberId"].metrics.$get({
        param: { memberId: member.id },
      });

      return await response.json();
    },
    enabled: !!member.id,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex h-full w-full items-center justify-end gap-1 px-2">
          <p>{getLevelLabel(member.level)}</p>
          <InfoIcon size={13} className="text-muted-foreground" />
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
    </TooltipProvider>
  );
};
