import { cn } from "@conquest/ui/utils/cn";
import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
};

export const Loader = ({ className }: Props) => {
  return (
    <Loader2
      className={cn("animate-spin size-5 text-muted-foreground", className)}
    />
  );
};
