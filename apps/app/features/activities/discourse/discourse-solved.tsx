import { SourceBadge } from "@/components/badges/source-badge";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
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

export const DiscourseSolved = ({ activity, member }: Props) => {
  const { discourse } = useIntegration();
  const { communityUrl } = discourse?.details ?? {};
  const { message, replyTo, channelId, createdAt } = activity;
  const { source } = activity.activityType;

  const { avatarUrl, firstName, lastName } = member ?? {};

  const { data: channel } = trpc.channels.get.useQuery(
    channelId ? { id: channelId } : skipToken,
  );

  const href = `${communityUrl}/${replyTo}`;

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
            solved the topic
            <span className="font-medium text-foreground">
              {" "}
              in #{channel?.name}
            </span>
          </p>
          <SourceBadge source={source} transparent onlyIcon />
          <p className="text-muted-foreground">{format(createdAt, "HH:mm")}</p>
        </div>
        <ActivityMenu activity={activity} href={href} />
      </div>
      <div className="mt-2 ml-7 rounded-md border p-3">
        <p
          dangerouslySetInnerHTML={{ __html: message }}
          className="whitespace-pre-wrap break-words"
        />
      </div>
    </div>
  );
};
