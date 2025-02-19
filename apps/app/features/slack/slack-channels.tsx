import { SLACK_ACTIVITY_TYPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { ArrowRight, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingChannels } from "../integrations/loading-channels";

export const SlackChannels = () => {
  const { setStep, channels } = useIntegration();
  const [loading, setLoading] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const utils = trpc.useUtils();

  const { mutateAsync: createManyActivityTypes } =
    trpc.activityTypes.createManyActivityTypes.useMutation({
      onSuccess: () => {
        utils.activityTypes.getAllActivityTypes.invalidate();
        setTimeout(() => {
          setLoading(false);
          setStep(1);
        }, 300);
      },
    });

  const { mutateAsync: createManyChannels } =
    trpc.channels.createManyChannels.useMutation({
      onSuccess: () => {
        utils.channels.getAllChannels.invalidate({ source: "SLACK" });
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
      source: "SLACK" as const,
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
            <button
              key={slackChannel.id}
              className="flex items-center gap-2"
              type="button"
              onClick={() => onSelect(slackChannel.id)}
            >
              <Checkbox checked={isSelected} disabled={loading} />
              <div className="flex items-center gap-1">
                <Hash size={16} />
                <p>{slackChannel.name}</p>
              </div>
            </button>
          );
        })}
      </div>
      <Button
        loading={loading}
        disabled={selectedChannels.length === 0 || loading}
        onClick={onClick}
      >
        Next
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};
