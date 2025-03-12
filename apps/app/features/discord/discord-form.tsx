import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installDiscord } from "@conquest/trigger/tasks/installDiscord";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { DiscordChannels } from "./discord-channels";

export const DiscordForm = () => {
  const { discord, loading, setLoading, step, setStep } = useIntegration();
  const { run_id } = discord ?? {};
  const utils = trpc.useUtils();

  const { data: currentRun } = trpc.integrations.getRun.useQuery({
    run_id: run_id ?? "",
  });

  const { mutateAsync } = trpc.integrations.update.useMutation({
    onSuccess: () => {
      utils.integrations.bySource.invalidate({
        source: "Discord",
      });
    },
  });

  const { submit, run } = useRealtimeTaskTrigger<typeof installDiscord>(
    "install-discord",
    { accessToken: discord?.trigger_token },
  );

  const onStart = async () => {
    if (!discord) return;

    setLoading(true);
    await mutateAsync({ id: discord.id, status: "SYNCING" });
    submit({ discord });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";

    if (["FAILED", "CRASHED", "EXPIRED"].includes(run.status)) {
      toast.error("Failed to install Discord", { duration: 5000 });
      setStep(0);
      setLoading(false);
    }

    if (isCompleted) {
      utils.integrations.bySource.invalidate({ source: "Discord" });
      utils.channels.list.invalidate({ source: "Discord" });
      utils.discord.listChannels.invalidate();
      setTimeout(() => setLoading(false), 1000);
    }
  }, [run]);

  useEffect(() => {
    if (discord?.status === "SYNCING") {
      setLoading(true);
      setStep(1);
    }
  }, [discord]);

  console.log("currentRun", currentRun);

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <DiscordChannels />}
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
              <ActivityTypesList source="Discord" disableHeader />
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
