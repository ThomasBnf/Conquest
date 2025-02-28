import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import type { installGithub } from "@conquest/trigger/tasks/installGithub";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { ActivityTypesList } from "../activities-types/activity-types-list";
import { LoadingMessage } from "../integrations/loading-message";
import { GithubRepo } from "./github-repo";

export const GithubForm = () => {
  const { github, loading, setLoading, step } = useIntegration();
  const router = useRouter();
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
    if (github?.status === "SYNCING") {
      setLoading(true);
    }

    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      router.refresh();
      setLoading(false);
      toast.error("Failed to install GitHub", { duration: 5000 });
    }

    if (isCompleted) router.refresh();
  }, [github, run]);

  return (
    <>
      <Separator className="my-4" />
      {step === 0 && <GithubRepo />}
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
              <ActivityTypesList source="Github" disableHeader />
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
