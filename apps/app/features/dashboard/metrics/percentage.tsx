import { TrendingDown, TrendingUp } from "lucide-react";

export const Percentage = ({ percentage }: { percentage: number }) => {
  if (percentage === 0) {
    return (
      <div className="flex items-center gap-1 rounded-md border border-muted bg-muted px-1 text-muted-foreground">
        <p className="text-xs">-%</p>
      </div>
    );
  }

  if (percentage > 0) {
    <div className="flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1 text-green-500">
      <TrendingUp size={15} />
      <p className="text-xs">{percentage.toFixed(0)}%</p>
    </div>;
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-1 text-red-500">
      <TrendingDown size={15} />
      <p className="text-xs">{percentage.toFixed(0)}%</p>
    </div>
  );
};
