import { SourceBadge } from "@/components/badges/source-badge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { ActivityMenu } from "../activity-menu";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const DiscourseInvite = ({ activity, member }: Props) => {
  const { slug } = useWorkspace();

  const { createdAt, inviteTo } = activity;
  const { source } = activity.activityType;

  const { avatarUrl, firstName, lastName } = member ?? {};

  const { data: joiner } = trpc.members.get.useQuery(
    inviteTo ? { id: inviteTo } : skipToken,
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={avatarUrl ?? ""} />
          <AvatarFallback className="text-sm">
            {firstName?.charAt(0).toUpperCase()}
            {lastName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {firstName} {lastName}
          </span>{" "}
          invited{" "}
          <Link
            href={`/${slug}/members/${joiner?.id}/analytics`}
            className="font-medium text-foreground hover:underline"
          >
            {joiner?.firstName} {joiner?.lastName}
          </Link>{" "}
          to join the {source === "Discord" ? "server" : "workspace"}
        </p>
        <SourceBadge source={source} transparent onlyIcon />
        <p className="text-muted-foreground">{format(createdAt, "HH:mm")}</p>
      </div>
      <ActivityMenu activity={activity} />
    </div>
  );
};
