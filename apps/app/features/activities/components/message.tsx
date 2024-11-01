import { SlackMarkdown } from "@/features/activities/components/slack/slack-markdown";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { SlackReaction } from "./slack/slack-reaction";
import { SlackReply } from "./slack/slack-reply";

type Props = {
  activity: ActivityWithMember;
  isNested?: boolean;
};

export const Message = ({ activity }: Props) => {
  const { type } = activity.details;

  if (type === "REACTION") {
    return <SlackReaction activity={activity} />;
  }

  if (type === "REPLY") {
    return <SlackReply activity={activity} />;
  }

  return <SlackMarkdown activity={activity} />;
};
