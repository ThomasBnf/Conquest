import { listChannels } from "@/client/channels/listChannels";
import { listSLackChannels } from "@/client/slack/listSlackChannels";
import { useUser } from "@/context/userContext";
import type { installSlack } from "@/trigger/installSlack.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "../integrations/loading-channels";
import { LoadingMessage } from "../integrations/loading-message";

type Props = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const SlackForm = ({ loading, setLoading }: Props) => {
  const { slack } = useUser();
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const router = useRouter();

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installSlack>(
    "install-slack",
    { accessToken: slack?.trigger_token },
  );

  const { channels } = listChannels();
  const { slackChannels, isLoading } = listSLackChannels();

  const onSelect = (channel: string | undefined) => {
    if (!channel) return;

    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((id) => id !== channel)
        : [...prev, channel],
    );
  };

  const onSelectAll = () => {
    setSelectedChannels(
      slackChannels?.map((channel) => channel.id ?? "") ?? [],
    );
  };

  const onUnselectAll = () => setSelectedChannels([]);

  const onStart = async () => {
    if (!slack) return;

    setLoading(true);
    submit({ slack, channels: selectedChannels });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      router.refresh();
      toast.error("Failed to install Slack", { duration: 5000 });
    }

    if (isCompleted) router.refresh();
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <div>
          <p className="mb-2 font-medium text-base">Channels</p>
          <Button
            variant="outline"
            size="xs"
            disabled={loading}
            onClick={
              selectedChannels.length === slackChannels?.length
                ? onUnselectAll
                : onSelectAll
            }
          >
            {selectedChannels.length === slackChannels?.length
              ? "Unselect all"
              : "Select all"}
          </Button>
        </div>
        {isLoading ? (
          <LoadingChannels />
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {slackChannels?.map((slackChannel) => {
                const isSelected = selectedChannels.some(
                  (channel) => channel === slackChannel.id,
                );
                const hasImported = channels?.some(
                  (channel) => channel.external_id === slackChannel.id,
                );

                return (
                  <button
                    key={slackChannel.id}
                    className={cn(
                      "flex items-center gap-2",
                      (hasImported || loading) && "opacity-50",
                    )}
                    type="button"
                    onClick={() => onSelect(slackChannel.id)}
                  >
                    <Checkbox
                      checked={isSelected || hasImported}
                      disabled={hasImported || loading}
                    />
                    <p>{slackChannel.name}</p>
                  </button>
                );
              })}
            </div>
            {loading && <LoadingMessage />}
            <Button
              loading={loading}
              disabled={selectedChannels.length === 0 || loading}
              onClick={onStart}
            >
              Let's start!
            </Button>
          </>
        )}
      </div>
    </>
  );
};
