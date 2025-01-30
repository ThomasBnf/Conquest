import { updateIntegration } from "@/actions/integrations/updateIntegration";
import { listChannels } from "@/client/channels/listChannels";
import { listDiscordChannels } from "@/client/discord/listChannels";
import { useUser } from "@/context/userContext";
import type { installDiscord } from "@conquest/trigger/tasks/installDiscord.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import {
  type APIGuildCategoryChannel,
  ChannelType,
} from "discord-api-types/v10";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "../integrations/loading-channels";
import { LoadingMessage } from "../integrations/loading-message";
import { EXCLUDED_CHANNEL_TYPES } from "./constant";
import { hasViewPermission } from "./helpers/hasViewPermission";

type Props = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const DiscordForm = ({ loading, setLoading }: Props) => {
  const { discord } = useUser();
  const [selectedChannels, setSelectedChannels] = useState<
    APIGuildCategoryChannel[]
  >([]);

  const { channels } = listChannels();
  const { discordChannels, isLoading } = listDiscordChannels();
  const router = useRouter();

  const categoriesChannels = discordChannels
    ?.filter(
      (channel) =>
        channel.type === ChannelType.GuildCategory &&
        hasViewPermission(channel),
    )
    .sort((a, b) => a.position - b.position);

  const subChannels = discordChannels?.filter(
    (channel) =>
      categoriesChannels?.some(
        (category) => category.id === channel.parent_id,
      ) &&
      !EXCLUDED_CHANNEL_TYPES.includes(channel.type) &&
      hasViewPermission(channel),
  );

  const isAllSelected =
    selectedChannels.length === subChannels?.length && !isLoading;

  const onSelect = (channel: APIGuildCategoryChannel) => {
    if (!channel) return;

    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((id) => id !== channel)
        : [...prev, channel],
    );
  };

  const onSelectAll = () => {
    setSelectedChannels(subChannels ?? []);
  };

  const onUnselectAll = () => setSelectedChannels([]);

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installDiscord>(
    "install-discord",
    { accessToken: discord?.trigger_token },
  );

  const onStart = async () => {
    if (!discord) return;

    setLoading(true);
    await updateIntegration({ id: discord.id, status: "SYNCING" });
    submit({ discord, channels: selectedChannels });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      router.refresh();
      toast.error("Failed to install Discord", { duration: 5000 });
      setLoading(false);
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
            onClick={isAllSelected ? onUnselectAll : onSelectAll}
          >
            {isAllSelected ? "Unselect all" : "Select all"}
          </Button>
        </div>
        {isLoading ? (
          <LoadingChannels />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {categoriesChannels?.map((category) => {
                const hasSubChannels = subChannels?.some(
                  (subChannel) => subChannel.parent_id === category.id,
                );

                if (!hasSubChannels) return null;
                return (
                  <div key={category.id} className="mt-2 flex flex-col gap-2">
                    <p className="font-medium text-muted-foreground text-xs uppercase">
                      {category.name}
                    </p>
                    <div className="flex flex-col gap-1">
                      {subChannels
                        ?.filter(
                          (subChannel) => subChannel.parent_id === category.id,
                        )
                        .sort((a, b) => a.position - b.position)
                        .map((subChannel) => {
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
                              <div className="flex items-center gap-1">
                                <Hash size={16} />
                                <p>{subChannel.name}</p>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
            {loading ? (
              <LoadingMessage />
            ) : (
              <Button
                className="mt-4"
                onClick={onStart}
                disabled={selectedChannels.length === 0}
              >
                Let's start
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
};
