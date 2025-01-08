import { listFiles } from "@/client/files/listFiles";
import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { SlackBadge } from "./slack-badge";
import { SlackImage } from "./slack-image";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const SlackActivity = ({ activity }: Props) => {
  const { name } = activity.activity_type;
  const { data: files } = listFiles({ activityId: activity.id });

  return (
    <ActivityCard
      activity={activity}
      badge={<SlackBadge label={name} />}
      className="from-slack"
    >
      <Message activity={activity} />
      {files && files.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {files.map((file) => (
            <SlackImage key={file.url} file={file} />
          ))}
        </div>
      )}
    </ActivityCard>
  );
};
