"use client";

import { Discourse } from "@/components/icons/Discourse";
import { Linkedin } from "@/components/icons/Linkedin";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { slug, slack, discourse, livestorm, linkedin } = useUser();

  const categories = [
    {
      label: "Community",
      integrations: [
        {
          href: `/${slug}/settings/integrations/slack`,
          logo: <Slack />,
          name: "Slack",
          description: "Synchronize your members with Slack",
          isConnected: slack?.status === "CONNECTED",
          isSyncing: slack?.status === "SYNCING",
        },
        {
          href: `/${slug}/settings/integrations/discourse`,
          logo: <Discourse />,
          name: "Discourse",
          description: "Synchronize your members with Discourse",
          isConnected: discourse?.status === "CONNECTED",
          isSyncing: discourse?.status === "SYNCING",
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
          description: "Connect your Linkedin account to your workspace",
          isConnected: linkedin?.status === "CONNECTED",
          isSyncing: linkedin?.status === "SYNCING",
        },
        {
          href: `/${slug}/settings/integrations/livestorm`,
          logo: <Livestorm />,
          name: "Livestorm",
          description: "Synchronize your members with Livestorm",
          isConnected: livestorm?.status === "CONNECTED",
          isSyncing: livestorm?.status === "SYNCING",
        },
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
              {category.integrations.map((integration) => (
                <Link
                  href={integration.href}
                  key={integration.name}
                  className="relative flex items-start gap-4 rounded-md border p-4 transition-colors hover:bg-muted-hover"
                >
                  {integration.logo}
                  <div>
                    <p className="font-medium text-lg leading-tight">
                      {integration.name}
                    </p>
                    <p className="text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                  {integration.isConnected && (
                    <Badge variant="success" className="absolute top-2 right-2">
                      Connected
                    </Badge>
                  )}
                  {integration.isSyncing && (
                    <Badge variant="outline" className="absolute top-2 right-2">
                      <Loader2 className="mr-1 size-3 animate-spin" />
                      Syncing
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
