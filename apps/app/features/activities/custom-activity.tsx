import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { cn } from "@conquest/ui/utils/cn";
import type { ActivityWithContact } from "@conquest/zod/activity.schema";
import { ActivityBadge } from "./activity-badge";
import { CreatedAt } from "./created-at";
import { Menu } from "./menu";
import { Message } from "./message";
import { SlackBadge } from "./slack-badge";

type Props = {
  activity: ActivityWithContact;
};

export const CustomActivity = ({ activity }: Props) => {
  const { avatar_url, first_name, full_name } = activity.contact ?? {};
  const { source, type } = activity.details;

  return (
    <div
      className={cn(
        "relative mt-5 rounded-[7px] bg-gradient-to-br from-0% to-border to-70% p-px shadow-sm",
        source === "API" && "from-main-500",
        source === "SLACK" && "from-slack",
      )}
    >
      {source === "API" && <ActivityBadge label={`API - ${type}`} />}
      {source === "SLACK" && <SlackBadge label={`${type}`} />}
      <div className="relative flex rounded-[6px] bg-background p-6">
        <Menu activity={activity} />
        <Avatar className="size-8">
          <AvatarImage src={avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {first_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-medium leading-none">{full_name}</p>
            <CreatedAt activity={activity} />
          </div>
          <Message activity={activity} />
        </div>
      </div>
    </div>
  );
};
