import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installDiscord } from "@conquest/trigger/tasks/installDiscord";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { DiscordChannels } from "./discord-channels";

export const DiscordForm = () => {
  const { discord, loading, setLoading, step, setStep } = useIntegration();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.updateIntegration.useMutation({
    onSuccess: () => {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "DISCORD",
      });
    },
  });

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installDiscord>(
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
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      setStep(0);
      setLoading(false);
      toast.error("Failed to install Discord", { duration: 5000 });
    }

    if (isCompleted) {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "DISCORD",
      });
      utils.channels.getAllChannels.invalidate();
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

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <DiscordChannels />}
      {step === 1 && (
        <div className="space-y-2">
          {loading ? (
            <LoadingMessage />
          ) : (
            <>
              <div>
                <p className="font-medium text-base">Activity types</p>
                <p className="text-muted-foreground">
                  Customize points for each activity type and set
                  channel-specific conditions now or later
                </p>
              </div>
              <ActivityTypesList source="DISCORD" disableHeader />
            </>
          )}
          <Button onClick={onStart} loading={loading} disabled={loading}>
            Let's start!
          </Button>
        </div>
      )}
    </>
  );
};
