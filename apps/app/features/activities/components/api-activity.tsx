import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { ActivityBadge } from "./activity-badge";
import { Menu } from "./activity-menu";
import { CreatedAt } from "./created-at";

type Props = {
  activity: ActivityWithMember;
};

export const APIActivity = ({ activity }: Props) => {
  const { avatar_url, first_name, last_name, full_name } =
    activity.member ?? {};
  const { message } = activity;
  const { key } = activity.activity_type;

  return (
    <div className="relative mt-5 rounded-[7px] bg-gradient-to-br from-0% from-main-500 to-70% to-border p-px shadow-sm">
      <ActivityBadge label={`API - ${key}`} />
      <div className="relative flex rounded-[6px] bg-background p-6">
        <Menu activity={activity} />
        <Avatar className="size-8">
          <AvatarImage src={avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {first_name?.charAt(0)}
            {last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <p className="font-medium text-sm leading-none">{full_name}</p>
            <CreatedAt activity={activity} />
          </div>
          <p className="whitespace-pre-wrap text-muted-foreground text-sm">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
