import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installLivestorm } from "@conquest/trigger/tasks/installLivestorm";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { LivestormFilter } from "./livestorm-filter";

export const LivestormForm = () => {
  const { livestorm, loading, setLoading, step, setStep } = useIntegration();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.updateIntegration.useMutation({
    onSuccess: () => {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "LIVESTORM",
      });
    },
  });

  const { submit, run } = useRealtimeTaskTrigger<typeof installLivestorm>(
    "install-livestorm",
    { accessToken: livestorm?.trigger_token },
  );

  const onStart = async () => {
    if (!livestorm) return;

    setLoading(true);
    await mutateAsync({ id: livestorm.id, status: "SYNCING" });
    submit({ livestorm });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";

    if (["FAILED", "CRASHED", "EXPIRED"].includes(run.status)) {
      setStep(0);
      setLoading(false);
      toast.error("Failed to install Livestorm", { duration: 5000 });
    }

    if (isCompleted) {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "LIVESTORM",
      });
      utils.events.listEvents.invalidate();
      setTimeout(() => setLoading(false), 1000);
    }
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <LivestormFilter />}
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
              <ActivityTypesList source="LIVESTORM" disableHeader />
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
