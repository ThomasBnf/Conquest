import { SourceBadge } from "@/components/badges/source-badge";
import { trpc } from "@/server/client";
import { emojiParser } from "@/utils/emoji-parser";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const SlackReaction = ({ activity, member }: Props) => {
  const { message, reactTo, channelId, createdAt } = activity;
  const { source } = activity.activityType;

  const { avatarUrl, firstName, lastName } = member ?? {};

  const { data: channel } = trpc.channels.get.useQuery(
    channelId ? { id: channelId } : skipToken,
  );

  const { data: permalink } = trpc.slack.getPermaLink.useQuery({
    channelId: channel?.externalId,
    messageTs: reactTo,
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={avatarUrl ?? ""} />
          <AvatarFallback>
            {firstName?.charAt(0).toUpperCase()}
            {lastName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {firstName} {lastName}
          </span>{" "}
          added reaction {emojiParser(message)}
          <span className="font-medium text-foreground">
            {" "}
            in #{channel?.name}
          </span>
        </p>
        <SourceBadge source={source} transparent onlyIcon />
        <p className="text-muted-foreground">{format(createdAt, "HH:mm")}</p>
      </div>
      <ActivityMenu activity={activity} href={permalink} />
    </div>
  );
};
