"use client";

import { buttonVariants } from "@conquest/ui/button";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { differenceInDays } from "date-fns";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  activity: ActivityWithType;
  href?: string | null | undefined;
};

export const ActivityLink = ({ activity, href }: Props) => {
  if (!href) return null;

  const isSlack = activity.activityType.source === "Slack";
  const isMoreThan90Days =
    differenceInDays(new Date(), activity.createdAt) > 90;

  if (isSlack && isMoreThan90Days) return null;

  return (
    <Link
      href={href}
      target="_blank"
      className={buttonVariants({ variant: "outline", size: "icon" })}
    >
      <ExternalLink size={16} />
    </Link>
  );
};
