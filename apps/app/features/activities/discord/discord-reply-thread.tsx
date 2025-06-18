import { SourceBadge } from "@/components/badges/source-badge";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const DiscordReplyThread = ({ activity, member }: Props) => {
  const { discord } = useIntegration();
  const { externalId: guildId } = discord ?? {};
  const { externalId, message, replyTo, createdAt } = activity;
  const { source } = activity.activityType;

  const { avatarUrl, firstName, lastName } = member ?? {};

  const { data: thread } = trpc.activities.get.useQuery(
    replyTo ? { externalId: replyTo } : skipToken,
  );

  const href = `https://discord.com/channels/${guildId}/${replyTo}/${externalId}`;

  return (
    <div>
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
            replied in thread
            <span className="font-medium text-foreground">
              {" "}
              in #{thread?.title}
            </span>
          </p>
          <SourceBadge source={source} transparent onlyIcon />
          <p className="text-muted-foreground">{format(createdAt, "HH:mm")}</p>
        </div>
        <ActivityMenu activity={activity} href={href} />
      </div>
      <div className="mt-2 ml-7 rounded-md border p-3">
        <ReactMarkdown className="whitespace-pre-wrap break-words">
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
};
