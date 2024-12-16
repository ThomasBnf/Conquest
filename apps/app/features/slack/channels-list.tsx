"use client";

import { useUser } from "@/context/userContext";

import { useListChannels } from "@/queries/hooks/useListChannels";
import { useListSLackChannels } from "@/queries/hooks/useListSlackChannels";
import type { installSlack } from "@/trigger/installSlack.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "./loading-channels";

export const ChannelsList = () => {
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

  const onStart = async () => {
    if (!slack) return;
    setLoading(true);
    submit({ integration: slack, channels: selectedChannels });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isCompleted || isFailed) {
      setLoading(false);
      refetchChannels();
      setSelectedChannels([]);
      router.refresh();

      if (isFailed) {
        toast.error("Failed to install Slack", { duration: 5000 });
      }
    }
  }, [run]);

  return (
    <div className="p-4">
      <Separator />
      <p className="mt-4 font-medium text-base">Imported channels</p>
      <Button variant="link" className="px-0" onClick={onSelectAll}>
        Select all channels
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
                  className="flex items-center gap-2"
                  type="button"
                  onClick={() => onSelect(slackChannel.id)}
                >
                  <Checkbox
                    checked={isSelected || hasImported}
                    disabled={hasImported}
                  />
                  <p>{slackChannel.name}</p>
                </button>
              );
            })}
          </div>
          {selectedChannels.length > 0 && (
            <Button loading={loading} onClick={onStart} className="mt-6">
              Let's start!
            </Button>
          )}
        </>
      )}
    </div>
  );
};
