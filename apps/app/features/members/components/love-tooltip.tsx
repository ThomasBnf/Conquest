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

export const LoveTooltip = ({ member }: Props) => {
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
          <p>{member.love}</p>
          <InfoIcon size={13} className="text-muted-foreground" />
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
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="w-36">Total Love</p>
              <p>{data?.total_love}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="w-36">Total Activities</p>
              <p>{data?.total_activities}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
