import { SourceBadge } from "@/components/badges/source-badge";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ActivityMenu } from "../activity-menu";
import { skipToken } from "@tanstack/react-query";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
};

export const DiscourseInvite = ({ activity, member }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};

  const { created_at, invite_to } = activity;
  const { source } = activity.activity_type;

  const { avatar_url, first_name, last_name } = member ?? {};

  const { data: joiner } = trpc.members.get.useQuery(
    invite_to ? { id: invite_to } : skipToken,
  );

  return (
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
          invited{" "}
          <Link
            href={`/${slug}/members/${joiner?.id}/analytics`}
            className="font-medium text-foreground hover:underline"
          >
            {joiner?.first_name} {joiner?.last_name}
          </Link>{" "}
          to join the {source === "Discord" ? "server" : "workspace"}
        </p>
        <SourceBadge source={source} transparent onlyIcon />
        <p className="text-muted-foreground">{format(created_at, "HH:mm")}</p>
      </div>
      <ActivityMenu activity={activity} />
    </div>
  );
};
