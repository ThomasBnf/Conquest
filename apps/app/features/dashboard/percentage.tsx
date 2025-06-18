import { Badge } from "@conquest/ui/badge";
import { Skeleton } from "@conquest/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  variation: number | undefined;
  isLoading: boolean;
  inverse?: boolean;
};

export const Percentage = ({ variation, isLoading, inverse }: Props) => {
  const fixedVariation = Number(variation?.toFixed(0));

  if (isLoading) {
    return <Skeleton className="h-[25.5px] w-14 shrink-0" />;
  }

  if (variation === undefined) {
    return <p className="text-muted-foreground">N/A</p>;
  }

  if (fixedVariation > 0) {
    return (
      <Badge variant={inverse ? "destructive" : "success"} className="gap-1">
        {fixedVariation}%
        <TrendingUp size={14} />
      </Badge>
    );
  }

  if (fixedVariation < 0) {
    return (
      <Badge variant={inverse ? "success" : "destructive"} className="gap-1">
        {fixedVariation}%
        <TrendingDown size={14} />
      </Badge>
    );
  }

  return <Badge variant="outline">-%</Badge>;
};
