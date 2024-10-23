import { SlackMarkdown } from "@/helpers/slack-markdown";
import { useGetActivity } from "@/queries/activities/useGetActivity";
import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import { ActivityCard } from "../activity-card";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReply = ({ activity }: Props) => {
  const slackActivity = ActivitySlackSchema.parse(activity.details);
  const { data } = useGetActivity({ ts: slackActivity.thread_ts });

  if (!data) return;

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        <SlackMarkdown activity={data} />
      </ActivityCard>
      <SlackMarkdown activity={activity} />
    </div>
  );
};
