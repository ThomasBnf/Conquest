import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Check, X } from "lucide-react";

type Props = {
  workflowId: string;
};

export const RunOverview = ({ workflowId }: Props) => {
  const { data } = trpc.runs.list.useQuery({ workflowId });

  const completedRuns = data?.filter((run) => run.completedAt && run.status !== "FAILED") ?? [];
  const failedRuns = data?.filter((run) => run.status === "FAILED") ?? [];
  const inProgressRuns = data?.filter((run) => !run.completedAt && run.status !== "FAILED") ?? [];

  const totalDuration = completedRuns.reduce((acc, run) => {
    if (!run.completedAt) return acc;

    const duration = run.completedAt.getTime() - run.createdAt.getTime();
    return acc + duration;
  }, 0);

  const avgDurationMs = totalDuration / (completedRuns.length || 1);

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.round((ms % (1000 * 60)) / 1000);

    if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const duration = formatDuration(avgDurationMs);

  return (
    <div className="mt-auto border-t p-4">
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
          {duration}
          <p>Avg. duration</p>
        </div>
      </div>
    </div>
  );
};
