import { cn } from "@conquest/ui/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { differenceInDays, format } from "date-fns";

type Props = {
  date: Date | undefined | null;
  className?: string;
};

export const DateCell = ({ date, className }: Props) => {
  if (!date) return;
  const days = differenceInDays(new Date(), date);

  return (
    <Tooltip>
      <TooltipTrigger>
        <p className={cn(className)}>{days > 0 ? `${days} days ago` : ""}</p>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{format(date, "PPp")}</p>
      </TooltipContent>
    </Tooltip>
  );
};
