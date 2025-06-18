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
  const { externalId, title, message, createdAt } = activity;
  const { source } = activity.activityType;
  const { avatarUrl, firstName, lastName } = member ?? {};

  if (!github) return null;

  const { details } = github;
  const { owner, repo } = details;

  const link = `https://github.com/${owner}/${repo}/pull/${externalId}`;

  return (
    <div>
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
            created a pull request
          </p>
          <SourceBadge source={source} transparent onlyIcon />
          <p className="text-muted-foreground">{format(createdAt, "HH:mm")}</p>
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
