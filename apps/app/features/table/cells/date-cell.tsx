import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { format, formatDistance } from "date-fns";

type Props = {
  date: Date | undefined | null;
};

export const DateCell = ({ date }: Props) => {
  if (!date) return;

  return (
    <Tooltip>
      <TooltipTrigger>
        <p className="h-full px-2">{formatDistance(date, new Date())}</p>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{format(date, "PPp")}</p>
      </TooltipContent>
    </Tooltip>
  );
};
