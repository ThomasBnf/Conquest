"use client";

import { Livestorm } from "@/components/icons/Livestorm";
import { useUser } from "@/context/userContext";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: {
    code: string | null;
  };
};

export default function Page({ searchParams: { code } }: Props) {
  const { slack } = useUser();

  const onInstall = () => {
    console.log("install");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Livestorm />
        </div>
        <p className="font-medium text-lg">Livestorm</p>
      </div>
      <Card>
        <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
          <div className="flex items-center">
            <Link
              href="https://doc.useconquest.com/livestorm"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "link", size: "xs" }),
                "flex w-fit items-center gap-2 text-foreground",
              )}
            >
              <ExternalLink size={15} />
              <p>Documentation</p>
            </Link>
            <Button>Install</Button>
          </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
