import { Badge } from "@conquest/ui/badge";
import { Skeleton } from "@conquest/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  variation: number | undefined;
  isLoading: boolean;
};

export const Percentage = ({ variation, isLoading }: Props) => {
  if (isLoading) {
    return <Skeleton className="h-[25.5px] w-14 shrink-0" />;
  }

  if (variation === undefined) {
    return <p className="text-muted-foreground text-sm">N/A</p>;
  }

  if (variation > 0) {
    return (
      <Badge variant="success" className="gap-1">
        {variation.toFixed(0)}%
        <TrendingUp size={14} />
      </Badge>
    );
  }

  if (variation < 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        {variation.toFixed(0)}%
        <TrendingDown size={14} />
      </Badge>
    );
  }

  return <Badge variant="secondary">0%</Badge>;
};
