"use client";

import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Duplicate } from "@conquest/ui/icons/Duplicate";
import Link from "next/link";

export const DuplicatesButton = () => {
  const { slug } = useWorkspace();
  const { data: count, isLoading } = trpc.duplicate.count.useQuery();

  if (isLoading || !count) return null;

  return (
    <Link
      href={`/${slug}/members/duplicates`}
      className={cn(buttonVariants({ variant: "outline" }), "pr-1")}
      prefetch
    >
      <Duplicate size={18} />
      <span>Duplicates</span>
      <Badge variant="outline" className="ml-auto">
        {count}
      </Badge>
    </Link>
  );
};
