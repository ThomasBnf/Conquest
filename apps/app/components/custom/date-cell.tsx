import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/tooltip";
import { format, formatDistance } from "date-fns";

type Props = {
  date: Date | undefined | null;
};

export const DateCell = ({ date }: Props) => {
  if (!date) return;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <p className="h-full px-2">
            {formatDistance(date, new Date(), { addSuffix: true })}
          </p>
        </TooltipTrigger>
        <TooltipContent>
          <p>{format(date, "PPPP 'at' p")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
