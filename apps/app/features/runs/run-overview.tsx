import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Check, X } from "lucide-react";

type Props = {
  workflowId: string;
};

export const RunOverview = ({ workflowId }: Props) => {
  const { data } = trpc.runs.list.useQuery({ workflowId });

  const completedRuns = data?.filter((run) => run.completedAt) ?? [];
  const failedRuns = data?.filter((run) => run.status === "FAILED") ?? [];
  const inProgressRuns = data?.filter((run) => !run.completedAt) ?? [];

  const totalDuration = completedRuns.reduce((acc, run) => {
    if (!run.completedAt) return acc;

    const duration = run.completedAt.getTime() - run.createdAt.getTime();
    return acc + duration;
  }, 0);

  const avgDurationMs = totalDuration / (completedRuns.length || 1);
  const minutes = Math.floor(avgDurationMs / 60000);
  const seconds = Math.round((avgDurationMs % 60000) / 1000);

  return (
    <div className="mt-auto p-4">
      <p className="font-medium">Overview</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="relative rounded-md border border-green-100 bg-green-50 p-2 text-green-700">
          {completedRuns.length}
          <p>Completed</p>
          <Badge
            variant="success"
            className="absolute top-2 right-2 size-5 rounded-md p-0"
          >
            <Check size={12} />
          </Badge>
        </div>
        <div className="relative rounded-md border border-red-100 bg-red-50 p-2 text-red-700">
          {failedRuns.length}
          <p>Failed</p>
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 size-5 rounded-md p-0"
          >
            <X size={12} />
          </Badge>
        </div>
        <div className="rounded-md border p-2">
          {inProgressRuns.length}
          <p>In progress</p>
        </div>
        <div className="rounded-md border p-2">
          {minutes}m {seconds}s<p>Avg. duration</p>
        </div>
      </div>
    </div>
  );
};
