"use client";

import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import Link from "next/link";

type Props = {
  activity: ActivityWithMember;
};

export const ActivityAvatar = ({ activity }: Props) => {
  const { slug } = useUser();
  const { avatar_url, first_name, last_name } = activity.member ?? {};

  return (
    <Link href={`/${slug}/members/${activity.member?.id}/analytics`}>
      <Avatar className="size-8">
        <AvatarImage src={avatar_url ?? ""} />
        <AvatarFallback className="text-sm">
          {first_name?.charAt(0)}
          {last_name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
};
