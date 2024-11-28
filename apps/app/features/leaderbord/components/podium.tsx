"use client";

import { useUser } from "@/context/userContext";
import { buttonVariants } from "@conquest/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/tooltip";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import Link from "next/link";

type Props = {
  member: MemberWithActivities;
  position: number;
};

export const Podium = ({ member, position }: Props) => {
  const { slug } = useUser();
  const { full_name, love } = member;

  const activities_types = member.activities?.reduce(
    (acc, activity) => {
      const name = activity.activity_type.name;
      const weight = activity.activity_type.weight;
      acc[name] = {
        count: (acc[name]?.count ?? 0) + 1,
        weight,
      };
      return acc;
    },
    {} as Record<string, { count: number; weight: number }>,
  );

  const sorted_activities_types = Object.entries(activities_types ?? {})
    .sort(([, a], [, b]) => b.weight - a.weight)
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, { count: number; weight: number }>,
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="relative">
          <Link
            href={`/${slug}/members/${member.id}`}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "-ml-2 text-xl hover:underline",
            )}
          >
            {full_name}
          </Link>
          <p className="-top-1.5 absolute right-0 text-3xl">
            {position === 0 && "🥇"}
            {position === 1 && "🥈"}
            {position === 2 && "🥉"}
          </p>
        </CardTitle>
        <CardDescription>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{member.love} love</TooltipTrigger>
              <TooltipContent>
                <div>
                  {Object.entries(sorted_activities_types ?? {}).map(
                    ([name, { count, weight }]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between text-sm"
                      >
                        <p className="w-36">{name}</p>
                        <p>
                          {count} * {weight} = {count * weight}
                        </p>
                      </div>
                    ),
                  )}
                  <div
                    className={cn(
                      "flex items-center justify-between text-sm",
                      member.love > 0 && "mt-2",
                    )}
                  >
                    <p className="w-36">Total love</p>
                    <p>{member.love}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="w-36">Total activities</p>
                    <p>{member.activities?.length}</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
