"use client";

import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { cn } from "@conquest/ui/cn";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { Menu } from "./activity-menu";
import { CreatedAt } from "./created-at";

type Props = {
  activity: ActivityWithMember;
  badge?: ReactNode;
  className?: string;
};

export const ActivityCard = ({
  activity,
  badge,
  className,
  children,
}: PropsWithChildren<Props>) => {
  const { slug } = useUser();
  const {
    member: { first_name, last_name, avatar_url },
  } = activity;

  return (
    <div
      className={cn(
        "relative rounded-[7px] p-px shadow-sm",
        badge
          ? "bg-gradient-to-br from-0% from-slack to-70% to-border"
          : "border",
        className,
      )}
    >
      {badge}
      <div
        className={cn(
          badge ? "p-6" : "p-3",
          "relative flex rounded-[6px] bg-background pr-16",
        )}
      >
        {badge && <Menu activity={activity} />}
        <Link
          href={`/${slug}/members/${activity.member?.id}`}
          className="h-fit"
        >
          <Avatar className="size-8">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0)}
              {last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="ml-4 flex w-full flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <Link
              href={`/${slug}/members/${activity.member?.id}`}
              className="font-medium text-sm leading-none hover:underline"
            >
              {first_name} {last_name}
            </Link>
            <CreatedAt activity={activity} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
