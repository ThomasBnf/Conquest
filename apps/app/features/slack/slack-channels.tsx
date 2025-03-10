import { LoadingChannels } from "@/components/states/loading-channels";
import { SLACK_ACTIVITY_TYPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { ArrowRight, Hash, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const SlackChannels = () => {
  const { setStep, channels } = useIntegration();
  const [loading, setLoading] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
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
    trpc.channels.postMany.useMutation({
      onSuccess: () => {
        utils.channels.list.invalidate({ source: "Slack" });
      },
    });

  const { data: slackChannels, isLoading } = trpc.slack.listChannels.useQuery();

  const onSelect = (channel: string | undefined) => {
    if (!channel) return;

    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((id) => id !== channel)
        : [...prev, channel],
    );
  };

  const onUnselectAll = () => setSelectedChannels([]);
  const onSelectAll = () => {
    setSelectedChannels(slackChannels?.map(({ id }) => id ?? "") ?? []);
  };

  const onClick = async () => {
    setLoading(true);

    const filteredChannels = slackChannels?.filter((channel) =>
      selectedChannels.includes(channel.id ?? ""),
    );

    const channelsData = filteredChannels?.map(({ id, name }) => ({
      external_id: id ?? "",
      name: name ?? "",
      source: "Slack" as const,
    }));

    if (!channelsData) return;

    await createManyChannels({ channels: channelsData });
    await createManyActivityTypes({ activity_types: SLACK_ACTIVITY_TYPES });
  };

  useEffect(() => {
    if (channels?.length) setStep(1);
  }, [channels]);

  if (isLoading) return <LoadingChannels />;

  return (
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
      <div className="flex flex-col gap-1">
        {slackChannels?.map((slackChannel) => {
          const isSelected = selectedChannels.some(
            (channel) => channel === slackChannel.id,
          );

          return (
            <div
              key={slackChannel.id}
              className="flex items-center gap-2"
              onClick={() => onSelect(slackChannel.id)}
            >
              <Checkbox checked={isSelected} disabled={loading} />
              <div className="flex items-center gap-1">
                <Hash size={16} />
                <p>{slackChannel.name}</p>
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
