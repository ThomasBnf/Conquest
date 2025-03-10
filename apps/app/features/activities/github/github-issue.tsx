import { SourceBadge } from "@/components/badges/source-badge";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const GithubIssue = ({ activity, member }: Props) => {
  const { title, message, created_at } = activity;
  const { source } = activity.activity_type;
  const { avatar_url, first_name, last_name } = member ?? {};

  const { data: link } = trpc.github.getLink.useQuery({ activity });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-5">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
              {last_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {first_name} {last_name}
            </span>{" "}
            created an issue
          </p>
          <SourceBadge source={source} transparent onlyIcon />
          <p className="text-muted-foreground">{format(created_at, "HH:mm")}</p>
        </div>
        <ActivityMenu activity={activity} href={link} />
      </div>
      <div className="mt-2 ml-7 rounded-md border p-3">
        <p className="font-medium">{title}</p>
        <p
          dangerouslySetInnerHTML={{ __html: message }}
          className="whitespace-pre-wrap"
        />
      </div>
    </div>
  );
};
