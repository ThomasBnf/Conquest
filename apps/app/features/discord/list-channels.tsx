"use client";

import { action } from "@/actions/discord/action";
import { listDiscordChannels } from "@/client/discord/listChannels";
import { useUser } from "@/context/userContext";
import type { installDiscord } from "@/trigger/installDiscord.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import {
  type APIGuildCategoryChannel,
  ChannelType,
} from "discord-api-types/v10";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "../slack/loading-channels";

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
  const { discordChannels, isLoading } = listDiscordChannels();
  const router = useRouter();

  const allFilteredChannels =
    discordChannels?.filter(
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
    if (!discordChannels) return;

    const allSubChannels = discordChannels.filter(
      (channel) =>
        channel.parent_id !== null &&
        !EXCLUDED_CHANNEL_TYPES.includes(channel.type),
    );

    setSelectedChannels(allSubChannels);
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
    // setLoading(true);
    await action({ discord, channels: selectedChannels });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      setLoading(false);
      console.log(error);
      toast.error("Failed to install Discord", { duration: 5000 });
    }

    if (isCompleted) {
      setSelectedChannels([]);
      router.refresh();
    }
  }, [run, error, router]);

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
                <ChannelGroup
                  key={channel.id}
                  channel={channel}
                  subChannels={subChannels}
                  onSelect={onSelect}
                  selectedChannels={selectedChannels}
                />
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

type Props = {
  channel: APIGuildCategoryChannel;
  subChannels: APIGuildCategoryChannel[];
  onSelect: (channel: APIGuildCategoryChannel) => void;
  selectedChannels: APIGuildCategoryChannel[];
};

const ChannelGroup = ({
  channel,
  subChannels,
  onSelect,
  selectedChannels,
}: Props) => (
  <div key={channel.id}>
    <p className="font-medium text-muted-foreground text-xs uppercase">
      {channel.name}
    </p>
    <div className="mt-2 flex flex-col gap-1">
      {subChannels.map((subChannel) => (
        <button
          type="button"
          key={subChannel.id}
          className="flex items-center gap-2"
          onClick={() => onSelect(subChannel)}
        >
          <Checkbox checked={selectedChannels.includes(subChannel)} />
          <p>{subChannel.name}</p>
        </button>
      ))}
    </div>
  </div>
);

const LoadingMessage = () => (
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
);
