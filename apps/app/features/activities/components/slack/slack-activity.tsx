import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import Image from "next/image";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { SlackBadge } from "./slack-badge";

type Props = {
  activity: ActivityWithMember;
};

export const SlackActivity = ({ activity }: Props) => {
  const { type, files } = ActivitySlackSchema.parse(activity.details);

  return (
    <ActivityCard activity={activity} badge={<SlackBadge label={type} />}>
      <Message activity={activity} />
      {files.length > 0 && (
        <div className="mt-2">
          {files.map((file) => {
            if (file.url.includes("pdf")) {
              return (
                <iframe
                  key={file.url}
                  src={file.url}
                  className="w-full h-full"
                  title={file.title}
                />
              );
            }

            return (
              <Image
                key={file.url}
                src={file.url}
                alt={file.title}
                width={350}
                height={225}
                className="border rounded-lg"
              />
            );
          })}
        </div>
      )}
    </ActivityCard>
  );
};
