"use client";

import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ChannelsList } from "@/features/slack/channels-list";
import { InstallButton } from "@/features/slack/install-button";
import { UninstallButton } from "@/features/slack/uninstall_button";
import { buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/src/utils/cn";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: {
    code: string | null;
  };
};

export default function Page({ searchParams: { code } }: Props) {
  const { slack } = useUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Slack />
        </div>
        <p className="font-medium text-lg">Slack</p>
      </div>
      <Card>
        <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
          <div className="flex items-center">
            <Link
              href="https://doc.useconquest.com/slack"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "link", size: "xs" }),
                "flex w-fit items-center gap-2 text-foreground",
              )}
            >
              <ExternalLink size={15} />
              <p>Documentation</p>
            </Link>
          </div>
          {!slack?.id && <InstallButton code={code} />}
          {slack?.status === "INSTALLED" && <UninstallButton />}
        </CardHeader>
        <CardContent className="mb-0.5 p-0">
          <div className="p-4">
            <p className="font-medium text-base">Overview</p>
            <p className="text-balance text-muted-foreground">
              Connect your Slack workspace to automatically sync messages,
              collect member interactions, and send personalized direct messages
              through automated workflows.
            </p>
          </div>
          {slack?.trigger_token && <ChannelsList />}
        </CardContent>
      </Card>
    </div>
  );
}
