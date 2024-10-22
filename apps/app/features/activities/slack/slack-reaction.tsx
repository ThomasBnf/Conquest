import { emojiParser } from "@/helpers/emoji-parser";
import { useGetActivity } from "@/queries/activities/useGetActivity";
import {
  ActivitySlackSchema,
  type ActivityWithContact,
} from "@conquest/zod/activity.schema";

type Props = {
  activity: ActivityWithContact;
  content: string;
};

export const Reaction = ({ activity, content }: Props) => {
  const slackActivity = ActivitySlackSchema.parse(activity.details);
  const { data } = useGetActivity({ id: slackActivity.reference });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground">{data?.details.message}</p>
      <p className="border border-[#1264a3] min-h-6 px-2 rounded-full bg-[#e3f8ff] w-fit flex items-center justify-center">
        {emojiParser(content)}
      </p>
    </div>
  );
};
