import { SourceBadge } from "@/components/badges/source-badge";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const DiscordThread = ({ activity, member }: Props) => {
  const { discord } = useIntegration();
  const { external_id: guild_id } = discord ?? {};
  const { external_id, title, message, channel_id, created_at } = activity;
  const { source } = activity.activity_type;

  const { avatar_url, first_name, last_name } = member ?? {};

  const { data: channel } = trpc.channels.get.useQuery(
    { id: channel_id },
    { enabled: !!channel_id },
  );

  const href = `https://discord.com/channels/${guild_id}/${channel?.external_id}/threads/${external_id}`;

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
            sent message
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
        <p className="font-semibold">{title}</p>
        <ReactMarkdown className="whitespace-pre-wrap">{message}</ReactMarkdown>
      </div>
    </div>
  );
};
