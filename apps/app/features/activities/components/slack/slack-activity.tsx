import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { SlackBadge } from "./slack-badge";
import { SlackImage } from "./slack-image";

type Props = {
  activity: ActivityWithMember;
};

export const SlackActivity = ({ activity }: Props) => {
  const { type, files } = ActivitySlackSchema.parse(activity.details);

  return (
    <ActivityCard activity={activity} badge={<SlackBadge label={type} />}>
      <Message activity={activity} />
      {files.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {files.map((file) => {
            if (!file.url) return;
            return <SlackImage key={file.url} url={file.url} />;
          })}
        </div>
      )}
    </ActivityCard>
  );
};
