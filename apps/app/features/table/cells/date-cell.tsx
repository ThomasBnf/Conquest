import { formatDate } from "@/utils/formatDate";
import { cn } from "@conquest/ui/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { format } from "date-fns";

type Props = {
  date: Date | undefined | null;
  className?: string;
};

export const DateCell = ({ date, className }: Props) => {
  if (!date) return;

  return (
    <Tooltip>
      <TooltipTrigger>
        <p className={cn(className)}>{formatDate(date)}</p>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{format(date, "PPp")}</p>
      </TooltipContent>
    </Tooltip>
  );
};
