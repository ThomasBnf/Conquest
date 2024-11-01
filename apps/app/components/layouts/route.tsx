import { cn } from "@conquest/ui/utils/cn";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  label: string;
  icon: ReactNode;
  href: string;
  isActive: boolean;
};

export const Route = ({ label, icon, href, isActive }: Props) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 items-center gap-2 rounded-lg border border-transparent px-2 transition-colors",
        isActive && "rounded-lg border-border bg-background shadow-sm",
        !isActive && "hover:bg-neutral-200",
      )}
    >
      {icon}
      <p>{label}</p>
    </Link>
  );
};
