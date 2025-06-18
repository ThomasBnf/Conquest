import { SourceBadge } from "@/components/badges/source-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const DiscourseLogin = ({ activity, member }: Props) => {
  const { createdAt } = activity;
  const { source } = activity.activityType;

  const { avatarUrl, firstName, lastName } = member ?? {};

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={avatarUrl ?? ""} />
          <AvatarFallback>
            {firstName?.charAt(0).toUpperCase()}
            {lastName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {firstName} {lastName}
          </span>{" "}
          logged in
        </p>
        <SourceBadge source={source} transparent onlyIcon />
        <p className="text-muted-foreground">{format(createdAt, "HH:mm")}</p>
      </div>
      <ActivityMenu activity={activity} />
    </div>
  );
};
