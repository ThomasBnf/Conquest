import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { WorkflowItem as WorkflowItemType } from "@conquest/zod/schemas/workflow.schema";
import { format } from "date-fns";
import Link from "next/link";
import { IsPublished } from "./is-published";
import { WorkflowMenu } from "./workflow-menu";

type Props = {
  workflow: WorkflowItemType;
  slug: string;
};

export const WorkflowItem = ({ workflow, slug }: Props) => {
  const { data: failedRun } = trpc.runs.getFailedRun.useQuery({
    workflowId: workflow.id,
  });

  const lastRun = workflow.runs[0];

  return (
    <div className="flex items-center border-b px-4 transition-colors hover:bg-muted-hover">
      <Link
        href={`/${slug}/workflows/${workflow.id}/editor`}
        className={cn(
          "flex h-12 flex-1 items-center",
          workflow.archivedAt && "opacity-50",
        )}
      >
        <p className="flex-[2] truncate font-medium">{workflow.name}</p>
        <div className="flex-1">
          <Badge variant="secondary" className="size-5 text-sm">
            {workflow._count.runs}
          </Badge>
        </div>
        <div className="flex-1">
          <IsPublished workflow={workflow} displaySwitch={false} />
        </div>
        <p className="flex-1">
          {lastRun?.createdAt ? format(lastRun?.createdAt, "PPp") : ""}
        </p>
        <p className="flex-1">
          {failedRun?.failedAt ? format(failedRun?.failedAt, "PPp") : ""}
        </p>
      </Link>
      <WorkflowMenu workflow={workflow} hasRuns={workflow._count.runs > 0} />
    </div>
  );
};
