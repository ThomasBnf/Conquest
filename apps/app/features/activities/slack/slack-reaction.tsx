import { emojiParser } from "@/helpers/emoji-parser";
import { useGetActivity } from "@/queries/activities/useGetActivity";
import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";

type Props = {
  activity: ActivityWithMember;
  content: string;
};

export const Reaction = ({ activity, content }: Props) => {
  const slackActivity = ActivitySlackSchema.parse(activity.details);
  const { data } = useGetActivity({ id: slackActivity.reference });

  if (!data) return;

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        <Message activity={data} />
      </ActivityCard>
      <p className="border border-[#1264a3] size-7 rounded-lg bg-[#e3f8ff] text-center place-content-center">
        {emojiParser(content)}
      </p>
    </div>
  );
};
