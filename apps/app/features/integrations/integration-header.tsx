"use client";

import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const IntegrationHeader = () => {
  return (
    <Link
      href="/settings/integrations"
      className={cn(
        buttonVariants({ variant: "link", size: "xs" }),
        "flex w-fit items-center gap-1 px-0 text-foreground",
      )}
    >
      <ArrowLeft size={16} />
      Integrations
    </Link>
  );
};
