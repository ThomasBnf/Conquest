"use client";

import { useUser } from "@/context/userContext";
import { ScrollArea } from "@conquest/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const { slug } = useUser();

  const integrations = [
    {
      href: `/${slug}/settings/integrations/slack`,
      src: "/social/slack.svg",
      name: "Slack",
      description: "Synchronize your members with Slack",
    },
    {
      href: `/${slug}/settings/integrations/discourse`,
      src: "/social/discourse.svg",
      name: "Discourse",
      description: "Synchronize your members with Discourse",
    },
  ];

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-3xl flex-col py-24">
        <p className="text-2xl font-medium">Integrations</p>
        <p className="text-muted-foreground">
          Synchronize data across platforms
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <Link
              href={integration.href}
              key={integration.name}
              className="flex items-start gap-4 rounded-md border p-4 hover:bg-muted-hover transition-colors"
            >
              <Image
                src={integration.src}
                alt={integration.name}
                width={24}
                height={24}
              />
              <div>
                <p className="text-lg font-medium leading-tight">
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
