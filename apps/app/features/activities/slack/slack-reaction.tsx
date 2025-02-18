import { SourceBadge } from "@/components/badges/source-badge";
import { useIntegration } from "@/context/integrationContext";
import { emojiParser } from "@/helpers/emoji-parser";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
  channel: Channel | null | undefined;
};

export const SlackReaction = ({ activity, member, channel }: Props) => {
  const { slack } = useIntegration();
  const { message, react_to, created_at } = activity;
  const { source } = activity.activity_type;

  const { avatar_url, first_name, last_name } = member ?? {};

  const { data: permalink } = trpc.slack.getPermaLink.useQuery({
    slack,
    channel_id: channel?.external_id,
    message_ts: react_to,
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {first_name?.charAt(0).toUpperCase()}
            {last_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {first_name} {last_name}
          </span>{" "}
          added reaction {emojiParser(message)}
          <span className="font-medium text-foreground">
            {" "}
            in #{channel?.name}
          </span>
        </p>
        <SourceBadge source={source} transparent onlyIcon />
        <p className="text-muted-foreground">{format(created_at, "HH:mm")}</p>
      </div>
      <ActivityMenu activity={activity} href={permalink} />
    </div>
  );
};
