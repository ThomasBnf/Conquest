import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installDiscourse } from "@conquest/trigger/tasks/installDiscourse";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { DiscourseApi } from "./discourse-api";
import { DiscourseChannels } from "./discourse-channels";

export const DiscourseForm = () => {
  const { data: session } = useSession();
  const { discourse, loading, setLoading, step, setStep } = useIntegration();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.update.useMutation({
    onSuccess: () => {
      utils.integrations.bySource.invalidate({
        source: "Discourse",
      });
    },
  });

  const { submit, run, error } = useRealtimeTaskTrigger<
    typeof installDiscourse
  >("install-discourse", {
    accessToken: discourse?.triggerToken,
  });

  const onStart = async () => {
    if (!discourse || !session) return;

    setLoading(true);
    await mutateAsync({ id: discourse.id, status: "SYNCING" });
    submit({ discourse });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      setStep(0);
      setLoading(false);
      toast.error("Failed to install Discourse", { duration: 5000 });
    }

    if (isCompleted) {
      utils.integrations.bySource.invalidate({ source: "Discourse" });
      utils.channels.list.invalidate();
      utils.discourse.listChannels.invalidate();
      setTimeout(() => setLoading(false), 1000);
    }
  }, [run]);

  useEffect(() => {
    if (discourse?.status === "SYNCING") {
      setLoading(true);
      setStep(2);
    }
  }, [discourse]);

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <DiscourseApi />}
      {step === 1 && <DiscourseChannels />}
      {step === 2 && (
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
              <ActivityTypesList source="Discourse" disableHeader />
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
