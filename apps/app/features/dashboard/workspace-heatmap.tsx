"use client";

import { Heatmap } from "@/components/custom/heatmap";
import { trpc } from "@/server/client";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";

type Props = {
  className?: string;
};

export const WorkspaceHeatmap = ({ className }: Props) => {
  const { data } = trpc.dashboard.heatmap.useQuery({});

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border shadow-sm",
        className,
      )}
    >
      <p className="bg-sidebar p-3 font-medium text-lg">Heatmap</p>
      <Separator />
      <div className="flex flex-col gap-2 p-4">
        <Heatmap activities={data} />
      </div>
    </div>
  );
};
