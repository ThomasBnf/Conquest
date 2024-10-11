import { ActivityWithContact } from "@/schemas/activity.schema";
import { ActivityBadge } from "./activity-badge";
import { AvatarActivity } from "./avatar-activity";
import { Menu } from "./menu";

type Props = {
  activity: ActivityWithContact;
};

export const CustomActivity = ({ activity }: Props) => {
  return (
    <div className="relative mt-5 rounded-[7px] bg-gradient-to-br from-main-500 from-0% to-border to-70% p-px shadow-sm">
      <ActivityBadge label={`API - ${activity.details.type}`} />
      <div className="relative flex flex-col rounded-[6px] bg-background p-6">
        <Menu activity={activity} />
        <AvatarActivity activity={activity} />
        <p className="ml-10 text-muted-foreground">{activity.details.message}</p>
      </div>
    </div>
  );
};
