import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { format, formatDistance } from "date-fns";
import { cn } from "@conquest/ui/cn";

type Props = {
  date: Date | undefined | null;
  className?: string;
};

export const DateCell = ({ date, className }: Props) => {
  if (!date) return;

  return (
    <Tooltip>
      <TooltipTrigger>
        <p className={cn(className)}>{formatDistance(date, new Date())}</p>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{format(date, "PPp")}</p>
      </TooltipContent>
    </Tooltip>
  );
};
