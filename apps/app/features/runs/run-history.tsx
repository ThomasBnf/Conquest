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
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center">
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
