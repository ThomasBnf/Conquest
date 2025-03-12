import { SourceBadge } from "@/components/badges/source-badge";
import { useIntegration } from "@/context/integrationContext";
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

export const DiscourseReply = ({ activity, member, channel }: Props) => {
  const { discourse } = useIntegration();
  const { community_url } = discourse?.details ?? {};
  const { message, reply_to, created_at } = activity;
  const { source } = activity.activity_type;

  const { avatar_url, first_name, last_name } = member ?? {};

  const href = `${community_url}/${reply_to}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
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
            replied
            <span className="font-medium text-foreground">
              {" "}
              in #{channel?.name}
            </span>
          </p>
          <SourceBadge source={source} transparent onlyIcon />
          <p className="text-muted-foreground">{format(created_at, "HH:mm")}</p>
        </div>
        <ActivityMenu activity={activity} href={href} />
      </div>
      <div className="mt-2 ml-7 rounded-md border p-3">
        <p
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </div>
    </div>
  );
};
