"use client";

import { ScrollArea } from "@conquest/ui/scroll-area";

export const WorkspaceHeatmap = () => {
  // const { data } = trpc.dashboard.heatmap.useQuery({});

  return (
    <div className="rounded-md border p-4 shadow-sm">
      <p className="font-medium text-lg">Heatmap</p>
      <ScrollArea className="h-full">
        <div className="mx-auto flex max-w-6xl flex-col overflow-hidden px-4">
          {/* <Heatmap activities={data} /> */}
        </div>
      </ScrollArea>
    </div>
  );
};
