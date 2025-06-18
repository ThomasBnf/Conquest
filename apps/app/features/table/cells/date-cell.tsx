import { cn } from "@conquest/ui/cn";
import { format } from "date-fns";

type Props = {
  date: Date | undefined | null;
  className?: string;
};

export const DateCell = ({ date, className }: Props) => {
  if (!date) return;

  return <p className={cn(className)}>{format(date, "PPp")}</p>;
};
