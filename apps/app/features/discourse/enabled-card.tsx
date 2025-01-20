"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { useUser } from "@/context/userContext";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DiscourseForm } from "./discourse-form";

type Props = {
  error: string;
};

export const EnabledCard = ({ error }: Props) => {
  const { slug, discourse } = useUser();
  const { trigger_token, trigger_token_expires_at } = discourse ?? {};
  const [loading, setLoading] = useState(discourse?.status === "SYNCING");
  const router = useRouter();

  const isEnabled = discourse?.status === "ENABLED";
  const isSyncing = discourse?.status === "SYNCING";
  const isConnected = discourse?.status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    setLoading(true);
    router.push("/connect/discourse");
  };

  const onDisconnect = async () => {
    if (!discourse) return;
    await deleteIntegration({ integration: discourse, source: "DISCOURSE" });
  };

  useEffect(() => {
    if (trigger_token_expires_at && trigger_token_expires_at < new Date()) {
      onDisconnect();
    }

    if (error) {
      switch (error) {
        case "invalid_code":
          toast.error("Error: Invalid code");
          break;
        case "already_connected":
          toast.error(
            "This Discourse workspace is already connected to another account",
            {
              duration: 10000,
            },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/discourse`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex w-full items-center justify-between">
          <Link
            href="https://docs.useconquest.com/discourse"
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
            <Button onClick={onEnable} loading={loading}>
              <CirclePlus size={16} />
              Enable
            </Button>
          )}
          {isEnabled && !loading && !isExpired && (
            <Button variant="destructive" onClick={onDisconnect}>
              Disconnect
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="mb-0.5 space-y-4">
        <div>
          <p className="font-medium text-base">Overview</p>
          <p className="text-balance text-muted-foreground">
            Connect your Discourse community to get a complete overview of your
            members and community activity.
          </p>
        </div>
        {(isEnabled || isSyncing) && !isExpired && (
          <DiscourseForm loading={loading} setLoading={setLoading} />
        )}
      </CardContent>
    </Card>
  );
};
