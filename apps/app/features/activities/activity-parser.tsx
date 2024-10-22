import type { ActivityWithContact } from "@conquest/zod/activity.schema";
import { APIActivity } from "./api-activity";
import { SlackActivity } from "./slack/slack-activity";

type Props = {
  activity: ActivityWithContact;
};

export const ActivityParser = ({ activity }: Props) => {
  const { source } = activity.details;

  switch (source) {
    case "API":
      return <APIActivity activity={activity} />;
    case "SLACK":
      return <SlackActivity activity={activity} />;
  }
};
