import { SourceBadge } from "@/components/badges/source-badge";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { format } from "date-fns";
import { ActivityMenu } from "./activity-menu";
import { DiscordMessage } from "./discord/discord-message";
import { DiscordReaction } from "./discord/discord-reaction";
import { DiscordReply } from "./discord/discord-reply";
import { DiscordThread } from "./discord/discord-thread";
import { DiscourseLogin } from "./discourse/discourse-login";
import { DiscourseReaction } from "./discourse/discourse-reaction";
import { DiscourseReply } from "./discourse/discourse-reply";
import { DiscourseSolved } from "./discourse/discourse-solved";
import { DiscourseTopic } from "./discourse/discourse-topic";
import { GithubComment } from "./github/github-comment";
import { GithubIssue } from "./github/github-issue";
import { SlackMessage } from "./slack/slack-message";
import { SlackReaction } from "./slack/slack-reaction";
import { SlackReply } from "./slack/slack-reply";

type Props = {
  activity: ActivityWithType;
};

export const ActivityParser = ({ activity }: Props) => {
  const { member_id, channel_id, invite_to } = activity;
  const { key } = activity.activity_type;

  const { data: member } = trpc.members.get.useQuery({
    id: member_id,
  });

  const { data: channel } = trpc.channels.get.useQuery(
    { id: channel_id },
    { enabled: !!channel_id },
  );

  // const { data: inviter } = trpc.members.get.useQuery(
  //   { id: invite_to },
  //   { enabled: !!invite_to },
  // );

  const { first_name, last_name, avatar_url } = member ?? {};
  const { activity_type, message, created_at } = activity;
  const { source } = activity_type;

  switch (key) {
    // case "discord:invite":
    //   return (
    //     <ActivityInvite activity={activity} member={member} inviter={inviter} />
    //   );
    case "discord:thread":
      return (
        <DiscordThread activity={activity} member={member} channel={channel} />
      );
    case "discord:reply_thread":
      return (
        <DiscordReply
          activity={activity}
          member={member}
          channel={channel}
          isThread
        />
      );
    case "discord:message":
      return (
        <DiscordMessage activity={activity} member={member} channel={channel} />
      );
    case "discord:reply":
      return (
        <DiscordReply activity={activity} member={member} channel={channel} />
      );
    case "discord:reaction":
      return (
        <DiscordReaction
          activity={activity}
          member={member}
          channel={channel}
        />
      );
    // case "discourse:invite":
    //   return (
    //     <ActivityInvite activity={activity} member={member} inviter={inviter} />
    //   );
    case "discourse:solved":
      return (
        <DiscourseSolved
          activity={activity}
          member={member}
          channel={channel}
        />
      );
    case "discourse:topic":
      return (
        <DiscourseTopic activity={activity} member={member} channel={channel} />
      );
    case "discourse:reply":
      return (
        <DiscourseReply activity={activity} member={member} channel={channel} />
      );
    case "discourse:reaction":
      return (
        <DiscourseReaction
          activity={activity}
          member={member}
          channel={channel}
        />
      );
    case "discourse:login": {
      return <DiscourseLogin activity={activity} member={member} />;
    }
    case "github:issue": {
      return <GithubIssue activity={activity} member={member} />;
    }
    case "github:comment": {
      return <GithubComment activity={activity} member={member} />;
    }
    // case "slack:invite":
    //   return (
    //     <ActivityInvite activity={activity} member={member} inviter={inviter} />
    //   );
    case "slack:message":
      return (
        <SlackMessage activity={activity} member={member} channel={channel} />
      );
    case "slack:reply":
      return (
        <SlackReply activity={activity} member={member} channel={channel} />
      );
    case "slack:reaction":
      return (
        <SlackReaction activity={activity} member={member} channel={channel} />
      );
    default:
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
              {message}
            </p>
            <p> - {activity_type.name}</p>
            <SourceBadge source={source} />
            <p className="text-muted-foreground">
              {format(created_at, "HH:mm")}
            </p>
          </div>
          <ActivityMenu activity={activity} />
        </div>
      );
  }
};
