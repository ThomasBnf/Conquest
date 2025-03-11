"use client";

import { Heatmap } from "@/components/custom/heatmap";
import { trpc } from "@/server/client";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/scroll-area";
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
      <ScrollArea className="h-full">
        <div className="mx-auto flex max-w-6xl flex-col overflow-hidden px-4">
          <Heatmap activities={data} />
        </div>
      </ScrollArea>
    </div>
  );
};
