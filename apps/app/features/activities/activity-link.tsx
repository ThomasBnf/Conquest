"use client";

import { buttonVariants } from "@conquest/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  href?: string | null | undefined;
};

export const ActivityLink = ({ href }: Props) => {
  if (!href) return null;

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
