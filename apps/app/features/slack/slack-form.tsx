import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installSlack } from "@conquest/trigger/tasks/installSlack";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { SlackChannels } from "./slack-channels";

export const SlackForm = () => {
  const { slack, loading, setLoading, step, setStep } = useIntegration();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.update.useMutation({
    onSuccess: () => {
      utils.integrations.bySource.invalidate({ source: "Slack" });
    },
  });

  const { submit, run } = useRealtimeTaskTrigger<typeof installSlack>(
    "install-slack",
    { accessToken: slack?.trigger_token },
  );

  const onStart = async () => {
    if (!slack) return;

    setLoading(true);
    await mutateAsync({ id: slack.id, status: "SYNCING" });
    submit({ slack });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";

    if (["FAILED", "CRASHED", "EXPIRED"].includes(run.status)) {
      setStep(0);
      setLoading(false);
      toast.error("Failed to install Slack", { duration: 5000 });
    }

    if (isCompleted) {
      utils.integrations.bySource.invalidate({ source: "Slack" });
      utils.channels.list.invalidate({ source: "Slack" });
      utils.slack.listChannels.invalidate();
      setTimeout(() => setLoading(false), 1000);
    }
  }, [run]);

  useEffect(() => {
    if (slack?.status === "SYNCING") {
      setLoading(true);
      setStep(1);
    }
  }, [slack]);

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <SlackChannels />}
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
              <ActivityTypesList source="Slack" disableHeader />
            </>
          )}
          {!loading && (
            <Button onClick={onStart} disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Let's start!"
              )}
            </Button>
          )}
        </div>
      )}
    </>
  );
};
