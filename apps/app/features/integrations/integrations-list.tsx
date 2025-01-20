"use client";

import { updateUser } from "@/actions/users/updateUser";
import { Discord } from "@/components/icons/Discord";
import { Discourse } from "@/components/icons/Discourse";
import { Linkedin } from "@/components/icons/Linkedin";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const IntegrationsList = () => {
  const { user, slug, discord, discourse, github, linkedin, livestorm, slack } =
    useUser();
  const router = useRouter();

  const onboadingCompleted = user?.onboarding;

  const onComplete = async () => {
    await updateUser({ onboarding: new Date() });
    router.push(`/${slug}`);
  };

  const categories = [
    {
      label: "Community",
      integrations: [
        {
          href: onboadingCompleted
            ? `/${slug}/settings/integrations/slack`
            : "/welcome/slack",
          logo: <Slack />,
          name: "Slack",
          description: "Synchronize your members with Slack",
          isConnected: slack?.status === "CONNECTED",
          isSyncing: slack?.status === "SYNCING",
          soon: false,
        },
        {
          href: onboadingCompleted
            ? `/${slug}/settings/integrations/discourse`
            : "/welcome/discourse",
          logo: <Discourse />,
          name: "Discourse",
          description: "Synchronize your members with Discourse",
          isConnected: discourse?.status === "CONNECTED",
          isSyncing: discourse?.status === "SYNCING",
          soon: false,
        },
        {
          href: onboadingCompleted
            ? `/${slug}/settings/integrations/discord`
            : "/welcome/discord",
          logo: <Discord />,
          name: "Discord",
          description: "Synchronize your members with Discord",
          isConnected: discord?.status === "CONNECTED",
          isSyncing: discord?.status === "SYNCING",
          soon: true,
        },
      ],
    },
    {
      label: "Marketing",
      integrations: [
        {
          href: onboadingCompleted
            ? `/${slug}/settings/integrations/linkedin`
            : "/welcome/linkedin",
          logo: <Linkedin />,
          name: "Linkedin",
          description: "Connect your Linkedin account to your workspace",
          isConnected: linkedin?.status === "CONNECTED",
          isSyncing: linkedin?.status === "SYNCING",
          soon: false,
        },
        {
          href: onboadingCompleted
            ? `/${slug}/settings/integrations/livestorm`
            : "/welcome/livestorm",
          logo: <Livestorm />,
          name: "Livestorm",
          description: "Synchronize your members with Livestorm",
          isConnected: livestorm?.status === "CONNECTED",
          isSyncing: livestorm?.status === "SYNCING",
          soon: false,
        },
        // {
        //   href: onboadingCompleted
        //     ? `/${slug}/settings/integrations/github`
        //     : "/welcome/github",
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
        {!onboadingCompleted && (
          <div className="mt-10 flex justify-end">
            <Button onClick={onComplete}>Continue</Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
