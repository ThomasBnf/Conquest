import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { EmptyRuns } from "./empty-runs";
import { RunItem } from "./run-item";

type Props = {
  workflowId: string;
};

export const RunHistory = ({ workflowId }: Props) => {
  const { data } = trpc.runs.list.useQuery({ workflowId });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-10">
        <p className="p-2 font-medium">Runs history</p>
      </div>
      {data?.length === 0 ? (
        <EmptyRuns />
      ) : (
        <ScrollArea className="flex-1">
          {data
            ?.slice()
            .reverse()
            .map((run, index) => (
              <RunItem key={run.id} run={run} index={data.length - index} />
            ))}
        </ScrollArea>
      )}
    </div>
  );
};
