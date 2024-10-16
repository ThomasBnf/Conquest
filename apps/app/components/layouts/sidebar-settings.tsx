"use client";

import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import { APIKey } from "components/icons/APIKey";
import { Tags } from "components/icons/Tags";
import { User } from "components/icons/User";
import { useUser } from "context/userContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Integration } from "../icons/Integration";
import { Route } from "./route";

export const SidebarSettings = () => {
  const { slug } = useUser();
  const pathname = usePathname();

  const routes = [
    {
      icon: <User className="size-[16px]" />,
      label: "Profile",
      href: `/w/${slug}/settings`,
      isActive: pathname === `/w/${slug}/settings`,
    },
    {
      icon: <Tags className="size-[16px]" />,
      label: "Tags",
      href: `/w/${slug}/settings/tags`,
      isActive: pathname.startsWith(`/w/${slug}/settings/tags`),
    },
    {
      icon: <Integration className="size-[18px]" />,
      label: "Integrations",
      href: `/w/${slug}/settings/integrations`,
      isActive: pathname.startsWith(`/w/${slug}/settings/integrations`),
    },
    {
      icon: <APIKey className="size-[18px]" />,
      label: "API",
      href: `/w/${slug}/settings/api`,
      isActive: pathname.startsWith(`/w/${slug}/settings/api`),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-48 w-full bg-secondary p-2">
      <Link
        href={`/w/${slug}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start gap-2 hover:bg-neutral-200",
        )}
      >
        <ArrowLeft className="size-4" />
        <p>Back</p>
      </Link>
      <div className="mt-6 space-y-0.5">
        {routes.map((route) => (
          <Route key={route.label} {...route} />
        ))}
      </div>
    </div>
  );
};
