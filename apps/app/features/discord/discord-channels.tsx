import { IconDoc } from "@/components/custom/icon-doc";
import { LoadingChannels } from "@/components/states/loading-channels";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { DISCORD_ACTIVITY_TYPES } from "@conquest/db/constant";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "../../../../packages/ui/src/lib/utils";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";
import { ArrowRight, Hash, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const DiscordChannels = () => {
  const { setStep, channels } = useIntegration();
  const [loading, setLoading] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<
    APIGuildCategoryChannel[]
  >([]);
  const utils = trpc.useUtils();

  const { mutateAsync: createManyActivityTypes } =
    trpc.activityTypes.postMany.useMutation({
      onSuccess: () => {
        utils.activityTypes.list.invalidate();
        setTimeout(() => {
          setLoading(false);
          setStep(1);
        }, 300);
      },
    });

  const { mutateAsync: createManyChannels } =
    trpc.channels.postMany.useMutation({});

  const { data: discordChannels, isLoading } =
    trpc.discord.listChannels.useQuery();

  const categoriesChannels = discordChannels?.sort(
    (a, b) => a.position - b.position,
  );

  const subChannels = discordChannels?.filter((channel) =>
    categoriesChannels?.some((category) => category.id === channel.parent_id),
  );

  const onSelect = (channel: APIGuildCategoryChannel) => {
    if (!channel) return;

    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((id) => id !== channel)
        : [...prev, channel],
    );
  };

  const onSelectAll = () => setSelectedChannels(subChannels ?? []);
  const onUnselectAll = () => setSelectedChannels([]);

  const onClick = async () => {
    setLoading(true);

    const channelsData = selectedChannels?.map(({ id, name }) => ({
      externalId: id ?? "",
      name: name ?? "",
      source: "Discord" as const,
    }));

    if (!channelsData) return;

    await createManyChannels({ channels: channelsData });
    await createManyActivityTypes({ activityTypes: DISCORD_ACTIVITY_TYPES });
  };

  useEffect(() => {
    if (channels?.length) setStep(1);
  }, [channels]);

  if (isLoading) return <LoadingChannels />;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium text-base">Channels</p>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            ⚠️ If missing channels, please check our documentation.
          </p>
          <IconDoc url="https://docs.useconquest.com/integrations/discord#missing-channels" />
        </div>
      </div>
      <Button
        variant="outline"
        size="xs"
        disabled={loading}
        onClick={
          selectedChannels.length === subChannels?.length
            ? onUnselectAll
            : onSelectAll
        }
      >
        {selectedChannels.length === subChannels?.length
          ? "Unselect all"
          : "Select all"}
      </Button>

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
                  ?.filter((subChannel) => subChannel.parent_id === category.id)
                  .sort((a, b) => a.position - b.position)
                  .map((subChannel) => {
                    const isSelected = selectedChannels.some(
                      (channel) => channel === subChannel,
                    );

                    const hasImported = channels?.some(
                      (channel) => channel.externalId === subChannel.id,
                    );

                    return (
                      <div
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
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
      <Button
        disabled={selectedChannels.length === 0 || loading}
        onClick={onClick}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Next
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
};
