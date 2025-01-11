"use client";

import { listChannels } from "@/client/channels/listChannels";
import { listDiscordChannels } from "@/client/discord/listChannels";
import { useUser } from "@/context/userContext";
import type { installDiscord } from "@/trigger/installDiscord.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import {
  type APIGuildCategoryChannel,
  ChannelType,
} from "discord-api-types/v10";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "../integrations/loading-channels";
import { LoadingMessage } from "../integrations/loading-message";

const EXCLUDED_CHANNEL_TYPES = [
  ChannelType.GuildStageVoice,
  ChannelType.GuildVoice,
] as number[];

export const ListDiscordChannels = () => {
  const { discord } = useUser();
  const [loading, setLoading] = useState(discord?.status === "SYNCING");
  const [selectedChannels, setSelectedChannels] = useState<
    APIGuildCategoryChannel[]
  >([]);

  const { channels, refetch } = listChannels();
  const { discordChannels, isLoading } = listDiscordChannels();
  const router = useRouter();

  const allFilteredChannels =
    discordChannels
      ?.sort((a, b) => a.position - b.position)
      .filter(
        (channel) =>
          channel.parent_id !== null &&
          !EXCLUDED_CHANNEL_TYPES.includes(channel.type),
      ) ?? [];

  const isAllSelected =
    selectedChannels.length === allFilteredChannels.length && !isLoading;

  const onSelect = (channel: APIGuildCategoryChannel) => {
    if (!channel) return;

    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((id) => id !== channel)
        : [...prev, channel],
    );
  };

  const onSelectAll = () => {
    const allSubChannels = discordChannels?.filter(
      (channel) =>
        channel.parent_id !== null &&
        !EXCLUDED_CHANNEL_TYPES.includes(channel.type),
    );

    setSelectedChannels(allSubChannels ?? []);
  };

  const onUnselectAll = () => setSelectedChannels([]);

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installDiscord>(
    "install-discord",
    {
      accessToken: discord?.trigger_token,
    },
  );

  const onStart = async () => {
    if (!discord) return;

    setLoading(true);
    submit({ discord, channels: selectedChannels });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      setLoading(false);
      toast.error("Failed to install Discord", { duration: 5000 });
    }

    if (isCompleted) {
      refetch();
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
        onClick={isAllSelected ? onUnselectAll : onSelectAll}
      >
        {isAllSelected ? "Unselect all" : "Select all"}
      </Button>
      {isLoading ? (
        <LoadingChannels />
      ) : (
        <>
          <div className="mt-2 flex flex-col gap-4">
            {discordChannels?.map((channel) => {
              if (
                channel.parent_id !== null ||
                EXCLUDED_CHANNEL_TYPES.includes(channel.type)
              ) {
                return null;
              }

              const subChannels = discordChannels
                ?.filter(
                  (c) =>
                    c.parent_id === channel.id &&
                    !EXCLUDED_CHANNEL_TYPES.includes(c.type),
                )
                .sort((a, b) => a.position - b.position);

              if (!subChannels?.length) return null;

              return (
                <div key={channel.id}>
                  <p className="font-medium text-muted-foreground text-xs uppercase">
                    {channel.name}
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {subChannels.map((subChannel) => {
                      const isSelected = selectedChannels.some(
                        (channel) => channel === subChannel,
                      );

                      const hasImported = channels?.some(
                        (channel) => channel.external_id === subChannel.id,
                      );

                      return (
                        <button
                          type="button"
                          key={subChannel.id}
                          className={cn(
                            "flex items-center gap-2",
                            (hasImported || loading) && "opacity-50",
                          )}
                          onClick={() => onSelect(subChannel)}
                        >
                          <Checkbox
                            checked={isSelected || hasImported}
                            disabled={hasImported || loading}
                          />
                          <p>{subChannel.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {loading && <LoadingMessage />}
          <Button
            className="mt-4"
            onClick={onStart}
            loading={loading}
            disabled={selectedChannels.length === 0 || loading}
          >
            Let's start
          </Button>
        </>
      )}
    </>
  );
};
