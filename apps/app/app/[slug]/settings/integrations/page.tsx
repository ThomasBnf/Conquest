"use client";

import { Discord } from "@/components/icons/Discord";
import { Discourse } from "@/components/icons/Discourse";
import { Linkedin } from "@/components/icons/Linkedin";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { user, slug, discord, discourse, linkedin, livestorm, slack } =
    useUser();

  const categories = [
    {
      label: "Community",
      integrations: [
        {
          href: `/${slug}/settings/integrations/slack`,
          logo: <Slack />,
          name: "Slack",
          description: "Sync your Slack community members",
          isConnected: slack?.status === "CONNECTED",
          isSyncing: slack?.status === "SYNCING",
          soon: false,
        },
        {
          href: `/${slug}/settings/integrations/discourse`,
          logo: <Discourse />,
          name: "Discourse",
          description: "Sync your Discourse community members",
          isConnected: discourse?.status === "CONNECTED",
          isSyncing: discourse?.status === "SYNCING",
          soon: false,
        },
        {
          href: `/${slug}/settings/integrations/discord`,
          logo: <Discord />,
          name: "Discord",
          description: "Sync your Discord community members",
          isConnected: discord?.status === "CONNECTED",
          isSyncing: discord?.status === "SYNCING",
          soon: false,
        },
      ],
    },
    {
      label: "Marketing",
      integrations: [
        {
          href: `/${slug}/settings/integrations/linkedin`,
          logo: <Linkedin />,
          name: "Linkedin",
          description: "Sync your Linkedin organization page",
          isConnected: linkedin?.status === "CONNECTED",
          isSyncing: linkedin?.status === "SYNCING",
          soon: false,
        },
        {
          href: `/${slug}/settings/integrations/livestorm`,
          logo: <Livestorm />,
          name: "Livestorm",
          description: "Sync your Livestorm events and attendees",
          isConnected: livestorm?.status === "CONNECTED",
          isSyncing: livestorm?.status === "SYNCING",
          soon: false,
        },
        // {
        //   href: `/${slug}/settings/integrations/github`,
        //   logo: <Github />,
        //   name: "Github",
        //   description: "Synchronize your members with Github",
        //   isConnected: github?.status === "CONNECTED",
        //   isSyncing: github?.status === "SYNCING",
        //   soon: false,
        // },
      ],
    },
  ];

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Integrations</p>
        <p className="text-muted-foreground">
          Synchronize data across platforms
        </p>
        {categories.map((category) => (
          <div key={category.label}>
            <p className="mt-4 mb-2 font-medium text-base">{category.label}</p>
            <div className="grid grid-cols-2 gap-4">
              {category.integrations.map((integration) => {
                const {
                  href,
                  logo,
                  name,
                  description,
                  isConnected,
                  isSyncing,
                  soon,
                } = integration;

                const isDisconnected =
                  user?.workspace.integrations.find(
                    (integration) =>
                      name.toUpperCase() === integration.details.source,
                  )?.status === "DISCONNECTED";

                return (
                  <Link
                    href={soon ? "" : href}
                    key={name}
                    className={cn(
                      "relative flex items-start gap-4 rounded-md border p-4 transition-colors hover:bg-muted-hover",
                      soon && "cursor-not-allowed",
                    )}
                  >
                    <div className={cn(soon && "opacity-50")}>{logo}</div>
                    <div className={cn(soon && "opacity-50")}>
                      <p className="font-medium text-lg leading-tight">
                        {name}
                      </p>
                      <p className="text-muted-foreground">{description}</p>
                    </div>
                    {isConnected && (
                      <Badge
                        variant="success"
                        className="absolute top-2 right-2"
                      >
                        Connected
                      </Badge>
                    )}
                    {isSyncing && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        <Loader2 className="mr-1 size-3 animate-spin" />
                        Syncing
                      </Badge>
                    )}
                    {isSyncing && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        <Loader2 className="mr-1 size-3 animate-spin" />
                        Syncing
                      </Badge>
                    )}
                    {isDisconnected && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        Disconnected
                      </Badge>
                    )}
                    {soon && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        Coming soon
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
