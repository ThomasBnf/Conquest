"use client";

import { Discourse } from "@/components/icons/Discourse";
import { useUser } from "@/context/userContext";
import { InstallForm } from "@/features/discourse/install-form";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/src/components/scroll-area";
import { CircleCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { discourse } = useUser();
  const { trigger_token, trigger_token_expires_at } = discourse ?? {};

  const router = useRouter();
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    router.push("/connect/discourse");
  };

  useEffect(() => {
    router.refresh();
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Discourse />
          </div>
          <p className="font-medium text-lg">Discourse</p>
        </div>
        <Card>
          <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
            <div className="flex w-full items-center justify-between">
              <Link
                href="https://doc.useconquest.com/discourse"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-2 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Documentation</p>
              </Link>
              {(!trigger_token || isExpired) && (
                <Button onClick={onEnable}>
                  <CircleCheck size={16} />
                  Enable
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="mb-0.5 p-0">
            <div className="p-4">
              <p className="font-medium text-base">Overview</p>
              <p className="text-balance text-muted-foreground">
                Connect your Discourse workspace to automatically sync messages,
                collect member interactions, and send personalized direct
                messages through automated workflows.
              </p>
            </div>
            {discourse?.status === "ENABLED" && !isExpired && <InstallForm />}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
