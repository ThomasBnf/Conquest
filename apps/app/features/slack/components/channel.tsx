import { Checkbox } from "@conquest/ui/checkbox";
import type { Channel as SlackChannel } from "@slack/web-api/dist/types/response/ChannelsCreateResponse";

type Props = {
  channel: SlackChannel;
  selected: string[];
  onSelect: (channel: string | undefined) => void;
};

export const Channel = ({ channel, selected, onSelect }: Props) => {
  if (!channel.id) return;

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={selected.includes(channel.id)}
        onCheckedChange={() => onSelect(channel.id)}
      />
      <p>{channel.name}</p>
    </div>
  );
};
