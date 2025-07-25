import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { timeParser } from "@/utils/time-parser";
import { Button } from "@conquest/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { Run } from "@conquest/zod/schemas/run.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Info, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RunStatus } from "./run-status";

type Props = {
  run: Run;
};

export const RunDetails = ({ run }: Props) => {
  const { slug } = useWorkspace();
  const { memberId, completedAt, credits, createdAt } = run;
  const router = useRouter();
  const utils = trpc.useUtils();

  const cancelRun = trpc.runs.cancel.useMutation({
    onSuccess: () => {
      toast.success("Run cancelled");
      utils.runs.get.invalidate({ id: run.id });
      utils.runs.list.invalidate();
    },
  });

  const runtime = completedAt ? completedAt.getTime() - createdAt.getTime() : 0;
  const error = run.runNodes.find((node) => node.data.status === "FAILED")?.data
    .error;

  const { data: member } = trpc.members.get.useQuery(
    memberId ? { id: memberId } : skipToken,
  );

  return (
    <div className="flex flex-col h-full divide-y">
      <div className="flex justify-between items-center p-1 h-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </Button>
          <p className="flex items-center p-2 h-10 font-medium">Runs details</p>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-y-4 p-4">
          <div className="space-y-1">
            <p className="text-muted-foreground">Status</p>
            <div className="flex items-center">
              <RunStatus status={run.status} />
              <p className="capitalize">{run.status.toLowerCase()}</p>
              {run.status === "WAITING" && (
                <Tooltip>
                  <TooltipTrigger className="ml-2">
                    <Info size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    Waiting for the next action to be triggered
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Runtime</p>
            <p>{timeParser(runtime)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Credits</p>
            <p>{credits}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Run at</p>
            <p>{format(run.createdAt, "PPp")}</p>
          </div>
          {memberId && (
            <div className="col-span-2 space-y-1">
              <p className="text-muted-foreground">Member</p>
              <p>
                <Link
                  href={`/${slug}/members/${memberId}/analytics`}
                  className="hover:underline"
                >
                  {member?.firstName} {member?.lastName}
                </Link>
              </p>
            </div>
          )}
          {error && (
            <div className="col-span-2 space-y-1">
              <p className="text-muted-foreground">Error</p>
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>
        {(run.status === "RUNNING" || run.status === "WAITING") && (
          <div className="p-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelRun.mutate({ id: run.id })}
              disabled={cancelRun.isPending}
              className="mt-auto w-full"
            >
              {cancelRun.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <X size={16} />
                  Cancel
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
