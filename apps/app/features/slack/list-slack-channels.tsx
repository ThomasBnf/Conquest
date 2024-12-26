"use client";

import { useUser } from "@/context/userContext";
import { useListChannels } from "@/queries/hooks/useListChannels";
import { useListSLackChannels } from "@/queries/hooks/useListSlackChannels";
import type { installSlack } from "@/trigger/installSlack.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/src/utils/cn";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "./loading-channels";

export const ListSlackChannels = () => {
  const { slack } = useUser();
  const [loading, setLoading] = useState(slack?.status === "SYNCING");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const router = useRouter();

  const { submit, run } = useRealtimeTaskTrigger<typeof installSlack>(
    "install-slack",
    {
      accessToken: slack?.trigger_token,
    },
  );

  const { data: channels, refetch: refetchChannels } = useListChannels();
  const { data: slackChannels, isLoading } = useListSLackChannels();

  const onSelect = (channel: string | undefined) => {
    if (!channel) return;

    if (selectedChannels.includes(channel)) {
      setSelectedChannels((prev) => prev.filter((id) => id !== channel));
    } else {
      setSelectedChannels((prev) => [...prev, channel]);
    }
  };

  const onSelectAll = () => {
    setSelectedChannels(
      slackChannels?.map((channel) => channel.id ?? "") ?? [],
    );
  };

  const onUnselectAll = () => {
    setSelectedChannels([]);
  };

  const onStart = async () => {
    if (!slack) return;
    setLoading(true);
    submit({ slack, channels: selectedChannels });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed) {
      setLoading(false);
      toast.error("Failed to install Slack", { duration: 5000 });
    }

    if (isCompleted) {
      refetchChannels();
      setSelectedChannels([]);
      router.refresh();
    }
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <p className="font-medium text-base">Imported channels</p>
      <Button
        variant="outline"
        size="xs"
        className="mt-3 mb-1.5"
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
      {isLoading ? (
        <LoadingChannels />
      ) : (
        <>
          <div className="mt-2 flex flex-col gap-1">
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
          {loading && (
            <div className="actions-secondary mt-6 rounded-md border p-4">
              <Info size={18} className="text-muted-foreground" />
              <p className="mt-2 mb-1 font-medium">Collecting data</p>
              <p className="text-muted-foreground">
                This may take a few minutes.
                <br />
                You can leave this page while we collect your data.
                <br />
                Do not hesitate to refresh the page to see data changes.
              </p>
            </div>
          )}
          <Button
            loading={loading}
            onClick={onStart}
            className="mt-6"
            disabled={selectedChannels.length === 0}
          >
            Let's start!
          </Button>
        </>
      )}
    </>
  );
};
