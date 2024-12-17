"use client";

import { Linkedin } from "@/components/icons/Linkedin";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { ScrollArea } from "@conquest/ui/scroll-area";
import Link from "next/link";

export default function Page() {
  const { slug } = useUser();

  const integrations = [
    {
      href: `/${slug}/settings/integrations/slack`,
      logo: <Slack />,
      name: "Slack",
      description: "Synchronize your members with Slack",
    },
    // {
    //   href: `/${slug}/settings/integrations/discourse`,
    //   logo: <Discourse />,
    //   name: "Discourse",
    //   description: "Synchronize your members with Discourse",
    // },
    {
      href: `/${slug}/settings/integrations/livestorm`,
      logo: <Livestorm />,
      name: "Livestorm",
      description: "Synchronize your members with Livestorm",
    },
    {
      href: `/${slug}/settings/integrations/linkedin`,
      logo: <Linkedin />,
      name: "Linkedin",
      description: "Connect your Linkedin account to your workspace",
    },
  ];

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Integrations</p>
        <p className="text-muted-foreground">
          Synchronize data across platforms
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <Link
              href={integration.href}
              key={integration.name}
              className="flex items-start gap-4 rounded-md border p-4 transition-colors hover:bg-muted-hover"
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
            </Link>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
