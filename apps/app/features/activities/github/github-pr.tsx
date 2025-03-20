import { SourceBadge } from "@/components/badges/source-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
  github: GithubIntegration | null;
};

export const GithubPr = ({ activity, member, github }: Props) => {
  const { external_id, title, message, created_at } = activity;
  const { source } = activity.activity_type;
  const { avatar_url, first_name, last_name } = member ?? {};

  if (!github) return null;

  const { details } = github;
  const { owner, repo } = details;

  const link = `https://github.com/${owner}/${repo}/pull/${external_id}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
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
            created a pull request
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
          className="whitespace-pre-wrap break-words"
        />
      </div>
    </div>
  );
};
