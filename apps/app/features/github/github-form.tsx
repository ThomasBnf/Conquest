import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installGithub } from "@conquest/trigger/tasks/installGithub";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { GithubRepo } from "./github-repo";

export const GithubForm = () => {
  const { github, loading, setLoading, step, setStep } = useIntegration();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.update.useMutation({
    onSuccess: () => {
      utils.integrations.bySource.invalidate({
        source: "Github",
      });
    },
  });

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installGithub>(
    "install-github",
    { accessToken: github?.trigger_token },
  );

  const onStart = async () => {
    if (!github) return;

    setLoading(true);
    await mutateAsync({ id: github.id, status: "SYNCING" });
    submit({ github });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";

    if (["FAILED", "CRASHED", "EXPIRED"].includes(run.status)) {
      toast.error("Failed to install Github", { duration: 5000 });
      setStep(0);
      setLoading(false);
    }

    if (isCompleted) {
      utils.integrations.bySource.invalidate({ source: "Slack" });
      utils.channels.list.invalidate({ source: "Slack" });
      utils.slack.listChannels.invalidate();
      setTimeout(() => setLoading(false), 1000);
    }
  }, [github]);

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <GithubRepo />}
      {step === 1 && (
        <div className="space-y-2">
          {loading ? (
            <LoadingMessage progress={Number(run?.metadata?.progress)} />
          ) : (
            <>
              <div>
                <p className="font-medium text-base">Activity types</p>
                <p className="text-muted-foreground">
                  Customize points for each activity type and set
                  channel-specific conditions now or later
                </p>
              </div>
              <ActivityTypesList source="Github" disableHeader />
            </>
          )}
          <Button onClick={onStart} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Let's start!"
            )}
          </Button>
        </div>
      )}
    </>
  );
};
