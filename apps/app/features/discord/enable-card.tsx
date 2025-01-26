"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
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
import { DiscordForm } from "./discord-form";

type Props = {
  error?: string;
};

export const EnableCard = ({ error }: Props) => {
  const { slug, discord } = useUser();
  const { trigger_token, trigger_token_expires_at } = discord ?? {};
  const [loading, setLoading] = useState(discord?.status === "SYNCING");
  const router = useRouter();

  const isEnabled = discord?.status === "ENABLED";
  const isSyncing = discord?.status === "SYNCING";
  const isConnected = discord?.status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = () => {
    setLoading(true);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      permissions: DISCORD_PERMISSIONS,
      scope: DISCORD_SCOPES,
    });

    router.push(`https://discord.com/oauth2/authorize?${params.toString()}`);
  };

  const onDisconnect = async () => {
    if (!discord) return;

    const response = await deleteIntegration({
      integration: discord,
      source: "DISCORD",
    });

    setLoading(false);
    const error = response?.serverError;
    if (error) toast.error(error);
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
            "This Discord server is already connected to another account",
            {
              duration: 10000,
            },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/discord`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <Link
            href="https://docs.useconquest.com/integrations/discord"
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
      </CardHeader>
      <CardContent className="mb-0.5">
        <p className="font-medium text-base">Overview</p>
        <p className="text-balance text-muted-foreground">
          Connect your Discord community to get a complete overview of your
          members and community activity.
        </p>
        {(isEnabled || isSyncing) && !isExpired && (
          <DiscordForm loading={loading} setLoading={setLoading} />
        )}
      </CardContent>
    </Card>
  );
};
