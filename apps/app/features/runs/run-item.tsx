import { useGetSlug } from "@/hooks/useGetSlug";
import { Run } from "@conquest/db/prisma";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RunStatus } from "./run-status";

type Props = {
  run: Run;
  index: number;
};

export const RunItem = ({ run, index }: Props) => {
  const slug = useGetSlug();
  const pathname = usePathname();
  const currentRun = pathname.split("/").pop();

  const { workflowId, status } = run;
  const isRunning = status === "RUNNING";

  return (
    <Link
      key={run.id}
      href={isRunning ? "" : `/${slug}/workflows/${workflowId}/runs/${run.id}`}
      prefetch
    >
      <Button
        variant="ghost"
        size="default"
        className={cn(
          "w-full rounded-none border-b px-2 text-left hover:bg-surface",
          run.id === currentRun && "bg-surface",
        )}
      >
        <div className="flex flex-1 items-center">
          <RunStatus status={run.status} />
          <p>Run #{index}</p>
        </div>
        {run.failedAt && (
          <p className="flex-1 text-destructive">
            Failed{" "}
            {formatDistance(run.failedAt, new Date(), {
              addSuffix: true,
            })}
          </p>
        )}
      </Button>
    </Link>
  );
};
