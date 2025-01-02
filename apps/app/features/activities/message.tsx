import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { DiscourseReaction } from "./discourse/discourse-reaction";
import { DiscourseReply } from "./discourse/discourse-reply";
import { Markdown } from "./markdown";
import { SlackReaction } from "./slack/slack-reaction";
import { SlackReply } from "./slack/slack-reply";

type Props = {
  activity: ActivityWithTypeAndMember;
  isNested?: boolean;
};

export const Message = ({ activity }: Props) => {
  const { key } = activity.activity_type;

  if (key === "slack:reaction") {
    return <SlackReaction activity={activity} />;
  }

  if (key === "slack:reply") {
    return <SlackReply activity={activity} />;
  }

  if (key === "discourse:reaction") {
    return <DiscourseReaction activity={activity} />;
  }

  if (key === "discourse:reply" || key === "discourse:solved") {
    return <DiscourseReply activity={activity} />;
  }

  if (key === "linkedin:like") {
    return <p>👍</p>;
  }

  return <Markdown activity={activity} />;
};
