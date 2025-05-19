import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
};

export const Loader = ({ className }: Props) => {
  return (
    <Loader2
      className={cn("size-5 animate-spin text-muted-foreground", className)}
    />
  );
};
