import { cn } from "@conquest/ui/cn";
import Link from "next/link";
import { ReactNode } from "react";

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
        "flex h-8 items-center gap-2 rounded-md border border-transparent px-2 transition-colors",
        isActive && "rounded-md border-border bg-background shadow-sm",
        !isActive && "hover:bg-[#EEEFF1]",
      )}
    >
      {icon}
      <p>{label}</p>
    </Link>
  );
};
