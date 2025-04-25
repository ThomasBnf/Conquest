import { LoadingChannels } from "@/components/states/loading-channels";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { DISCOURSE_ACTIVITY_TYPES } from "@conquest/db/constant";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import type { Category } from "@conquest/zod/types/discourse";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { groupChannels } from "./helpers/groupChannels";
import { parseChannelName } from "./helpers/parseChannelName";

export const DiscourseChannels = () => {
  const { setStep, channels } = useIntegration();
  const [loading, setLoading] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Category[]>([]);
  const utils = trpc.useUtils();

  const { mutateAsync: createManyActivityTypes } =
    trpc.activityTypes.postMany.useMutation({
      onSuccess: () => {
        utils.integrations.bySource.invalidate({
          source: "Discourse",
        });
        utils.activityTypes.list.invalidate();
        setTimeout(() => {
          setLoading(false);
          setStep(2);
        }, 300);
      },
    });

  const { mutateAsync: createManyChannels } =
    trpc.channels.postMany.useMutation({
      onSuccess: () => {
        utils.channels.list.invalidate({ source: "Discourse" });
      },
    });

  const { data: discourseChannels, isLoading } =
    trpc.discourse.listChannels.useQuery();

  const groupedChannels = groupChannels(discourseChannels ?? []);

  const onSelect = (channel: Category, isChecked: boolean) => {
    if (!channel.parent_category_id) {
      const directChildren =
        discourseChannels?.filter(
          (ch) => ch.parent_category_id === channel.id,
        ) ?? [];

      const grandChildren = directChildren.flatMap(
        (child) =>
          discourseChannels?.filter(
            (ch) => ch.parent_category_id === child.id,
          ) ?? [],
      );

      const allChannels = [channel, ...directChildren, ...grandChildren];

      setSelectedChannels((prev) => {
        const newSelection = isChecked
          ? [...new Set([...prev, ...allChannels])]
          : prev.filter((ch) => !allChannels.some((ac) => ac.id === ch.id));

        return newSelection;
      });
    } else {
      const directChildren =
        discourseChannels?.filter(
          (ch) => ch.parent_category_id === channel.id,
        ) ?? [];

      const allChannels = [channel, ...directChildren];

      setSelectedChannels((prev) =>
        isChecked
          ? [...new Set([...prev, ...allChannels])]
          : prev.filter((ch) => !allChannels.some((ac) => ac.id === ch.id)),
      );
    }
  };

  const onUnselectAll = () => setSelectedChannels([]);

  const onSelectAll = () => {
    if (!discourseChannels) return;

    const allChannelsWithChildren = discourseChannels
      .filter((channel) => !channel.read_restricted)
      .reduce((acc: Category[], channel) => {
        if (!channel.parent_category_id) {
          const directChildren = discourseChannels.filter(
            (ch) => ch.parent_category_id === channel.id,
          );

          const grandChildren = directChildren.flatMap((child) =>
            discourseChannels.filter(
              (ch) => ch.parent_category_id === child.id,
            ),
          );

          return [...(acc ?? []), channel, ...directChildren, ...grandChildren];
        }
        return acc;
      }, []);

    setSelectedChannels(allChannelsWithChildren);
  };

  const onClick = async () => {
    setLoading(true);

    const channels = selectedChannels.map((channel) => ({
      externalId: channel.id.toString(),
      name: parseChannelName(channel, discourseChannels ?? []),
      slug: channel.slug ?? "",
      source: "Discourse" as const,
    }));

    await createManyChannels({ channels });
    await createManyActivityTypes({
      activityTypes: DISCOURSE_ACTIVITY_TYPES,
    });
  };

  const isChannelIndeterminate = (channel: Category) => {
    if (!discourseChannels) return false;

    const directChildren = discourseChannels.filter(
      (ch) => ch.parent_category_id === channel.id,
    );

    const grandChildren = directChildren.flatMap(
      (child) =>
        discourseChannels.filter((ch) => ch.parent_category_id === child.id) ??
        [],
    );

    const allSubChannels = [...directChildren, ...grandChildren];

    const selectedSubChannels = allSubChannels.filter((ch) =>
      selectedChannels.some((selected) => selected.id === ch.id),
    );

    return (
      selectedSubChannels.length > 0 &&
      selectedSubChannels.length < allSubChannels.length
    );
  };

  const isChannelSelected = (channel: Category) => {
    if (!discourseChannels) return false;

    const directChildren = discourseChannels.filter(
      (ch) => ch.parent_category_id === channel.id,
    );

    const grandChildren = directChildren.flatMap(
      (child) =>
        discourseChannels.filter((ch) => ch.parent_category_id === child.id) ??
        [],
    );

    const allSubChannels = [...directChildren, ...grandChildren];

    return (
      selectedChannels.some((ch) => ch.id === channel.id) &&
      allSubChannels.every((ch) =>
        selectedChannels.some((selected) => selected.id === ch.id),
      )
    );
  };

  useEffect(() => {
    if (channels?.length) setStep(2);
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
            selectedChannels.length === discourseChannels?.length
              ? onUnselectAll
              : onSelectAll
          }
        >
          {selectedChannels.length === discourseChannels?.length
            ? "Unselect all"
            : "Select all"}
        </Button>
      </div>
      <div>
        {groupedChannels.map((groupChannel) => (
          <div key={groupChannel.id}>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  isChannelSelected(groupChannel) ||
                  (isChannelIndeterminate(groupChannel) && "indeterminate")
                }
                onCheckedChange={(checked) => onSelect(groupChannel, !!checked)}
              />
              <p className="font-medium">{groupChannel.name}</p>
            </div>
            <div className="my-2">
              {groupChannel.children.length > 0 && (
                <div className="space-y-2">
                  {groupChannel.children.map((children) => (
                    <div key={children.id} className="ml-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            isChannelSelected(children) ||
                            (isChannelIndeterminate(children) &&
                              "indeterminate")
                          }
                          onCheckedChange={(checked) =>
                            onSelect(children, !!checked)
                          }
                        />
                        <p>{children.name}</p>
                      </div>
                      <div className="my-2">
                        {children.children.length > 0 && (
                          <div className="mt-3 mb-1 flex flex-col gap-2">
                            {children.children.map((grandchild) => (
                              <div
                                key={grandchild.id}
                                className="ml-4 flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={selectedChannels.some(
                                    (ch) => ch.id === grandchild.id,
                                  )}
                                  onCheckedChange={(checked) =>
                                    onSelect(grandchild, !!checked)
                                  }
                                />
                                <p>{grandchild.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
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
