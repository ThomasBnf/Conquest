"use client";

import { useUser } from "@/context/userContext";
import { buttonVariants } from "@conquest/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { cn } from "@conquest/ui/utils/cn";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import Link from "next/link";

type Props = {
  member: MemberWithActivities;
  position: number;
};

export const Podium = ({ member, position }: Props) => {
  const { slug } = useUser();
  const { full_name, activities } = member;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="relative">
          <Link
            href={`/${slug}/members/${member.id}`}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "-ml-2  text-xl",
            )}
          >
            {full_name}
          </Link>
          <p className="absolute -top-1.5 right-0 text-3xl">
            {position === 0 && "🥇"}
            {position === 1 && "🥈"}
            {position === 2 && "🥉"}
          </p>
        </CardTitle>
        <CardDescription>{activities.length} activities</CardDescription>
      </CardHeader>
    </Card>
  );
};
