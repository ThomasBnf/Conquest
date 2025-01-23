"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LivestormForm } from "./livestorm-form";

type Props = {
  error: string;
};

export const EnableCard = ({ error }: Props) => {
  const { slug, livestorm } = useUser();
  const { trigger_token, trigger_token_expires_at } = livestorm ?? {};
  const [loading, setLoading] = useState(livestorm?.status === "SYNCING");
  const router = useRouter();

  const isEnabled = livestorm?.status === "ENABLED";
  const isSyncing = livestorm?.status === "SYNCING";
  const isConnected = livestorm?.status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
      redirect_uri: "https://app.useconquest.com/connect/livestorm",
      scope: encodeURIComponent(
        "identity:read events:read webhooks:read webhooks:write",
      ),
    });

    router.push(
      `https://app.livestorm.co/oauth/authorize?${params.toString()}`,
    );
  };

  const onDisconnect = async () => {
    if (!livestorm) return;
    await deleteIntegration({ integration: livestorm, source: "LIVESTORM" });
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
            "This Livestorm workspace is already connected to another account",
            {
              duration: 10000,
            },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/livestorm`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex w-full items-center justify-between">
          <Link
            href="https://docs.useconquest.com/integrations/livestorm"
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
            <Button onClick={onEnable} loading={loading} disabled={loading}>
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
      <CardContent className="mb-0.5">
        <p className="font-medium text-base">Overview</p>
        <p className="text-balance text-muted-foreground">
          Connect your Livestorm workspace to access all your webinar sessions
          and participant data.
        </p>
        {(isEnabled || isSyncing) && !isExpired && (
          <LivestormForm loading={loading} setLoading={setLoading} />
        )}
      </CardContent>
    </Card>
  );
};
