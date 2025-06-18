import { SourceBadge } from "@/components/badges/source-badge";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { format } from "date-fns";
import { ActivityMenu } from "./activity-menu";
import { DiscordMessage } from "./discord/discord-message";
import { DiscordReaction } from "./discord/discord-reaction";
import { DiscordReply } from "./discord/discord-reply";
import { DiscordReplyThread } from "./discord/discord-reply-thread";
import { DiscordThread } from "./discord/discord-thread";
import { DiscourseInvite } from "./discourse/discourse-invite";
import { DiscourseLogin } from "./discourse/discourse-login";
import { DiscourseReaction } from "./discourse/discourse-reaction";
import { DiscourseReply } from "./discourse/discourse-reply";
import { DiscourseSolved } from "./discourse/discourse-solved";
import { DiscourseTopic } from "./discourse/discourse-topic";
import { GithubComment } from "./github/github-comment";
import { GithubIssue } from "./github/github-issue";
import { GithubPr } from "./github/github-pr";
import { GithubStar } from "./github/github-star";
import { LivestormAttendee } from "./livestorm/livestorm-attendee";
import { LivestormCohost } from "./livestorm/livestorm-cohost";
import { LivestormRegister } from "./livestorm/livestorm-register";
import { SlackMessage } from "./slack/slack-message";
import { SlackReaction } from "./slack/slack-reaction";
import { SlackReply } from "./slack/slack-reply";

type Props = {
  activity: ActivityWithType;
};

export const ActivityParser = ({ activity }: Props) => {
  const { memberId } = activity;
  const { key } = activity.activityType;

  const { data: member } = trpc.members.get.useQuery({ id: memberId });

  const { data } = trpc.integrations.bySource.useQuery({ source: "Github" });
  const github = data ? GithubIntegrationSchema.parse(data) : null;

  const { firstName, lastName, avatarUrl } = member ?? {};
  const { activityType, message, createdAt } = activity;
  const { source } = activityType;

  switch (key) {
    case "discord:thread": {
      return <DiscordThread activity={activity} member={member} />;
    }
    case "discord:reply_thread": {
      return <DiscordReplyThread activity={activity} member={member} />;
    }
    case "discord:message": {
      return <DiscordMessage activity={activity} member={member} />;
    }
    case "discord:reply": {
      return <DiscordReply activity={activity} member={member} />;
    }
    case "discord:reaction": {
      return <DiscordReaction activity={activity} member={member} />;
    }
    case "discourse:invite": {
      return <DiscourseInvite activity={activity} member={member} />;
    }
    case "discourse:solved": {
      return <DiscourseSolved activity={activity} member={member} />;
    }
    case "discourse:topic": {
      return <DiscourseTopic activity={activity} member={member} />;
    }
    case "discourse:reply": {
      return <DiscourseReply activity={activity} member={member} />;
    }
    case "discourse:reaction": {
      return <DiscourseReaction activity={activity} member={member} />;
    }
    case "discourse:login": {
      return <DiscourseLogin activity={activity} member={member} />;
    }
    case "github:star": {
      return <GithubStar activity={activity} member={member} github={github} />;
    }
    case "github:pr": {
      return <GithubPr activity={activity} member={member} github={github} />;
    }
    case "github:issue": {
      return (
        <GithubIssue activity={activity} member={member} github={github} />
      );
    }
    case "github:comment": {
      return (
        <GithubComment activity={activity} member={member} github={github} />
      );
    }
    case "livestorm:register": {
      return <LivestormRegister activity={activity} member={member} />;
    }
    case "livestorm:attend": {
      return <LivestormAttendee activity={activity} member={member} />;
    }
    case "livestorm:co-host": {
      return <LivestormCohost activity={activity} member={member} />;
    }
    case "slack:message": {
      return <SlackMessage activity={activity} member={member} />;
    }
    case "slack:reply": {
      return <SlackReply activity={activity} member={member} />;
    }
    case "slack:reaction": {
      return <SlackReaction activity={activity} member={member} />;
    }
    default: {
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
              {message}
            </p>
            <p> - {activityType.name}</p>
            <SourceBadge source={source} />
            <p className="text-muted-foreground">
              {format(createdAt, "HH:mm")}
            </p>
          </div>
          <ActivityMenu activity={activity} />
        </div>
      );
    }
  }
};
