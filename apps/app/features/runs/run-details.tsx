import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { timeParser } from "@/utils/time-parser";
import { Button } from "@conquest/ui/button";
import { Run } from "@conquest/zod/schemas/run.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RunStatus } from "./run-status";

type Props = {
  run: Run;
};

export const RunDetails = ({ run }: Props) => {
  const { slug } = useWorkspace();
  const { memberId, completedAt, credits, createdAt } = run;
  const router = useRouter();

  const runtime = completedAt ? completedAt.getTime() - createdAt.getTime() : 0;
  const error = run.runNodes.find((node) => node.data.status === "FAILED")?.data
    .error;

  const { data: member } = trpc.members.get.useQuery(
    memberId ? { id: memberId } : skipToken,
  );

  return (
    <div className="divide-y">
      <div className="flex h-10 items-center p-1">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
      </div>
      <p className="flex h-10 items-center p-2 font-medium">Runs details</p>
      <div className="grid grid-cols-2 gap-y-4 p-4">
        <div className="space-y-1">
          <p className="text-muted-foreground">Status</p>
          <div className="flex items-center">
            <RunStatus status={run.status} />
            <p className="capitalize">{run.status.toLowerCase()}</p>
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
          <div className="space-y-1">
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
    </div>
  );
};
