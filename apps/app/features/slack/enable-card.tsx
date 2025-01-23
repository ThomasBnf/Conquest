"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { SLACK_SCOPES, USER_SCOPES } from "@/constant";
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
import { ListSlackChannels } from "./list-slack-channels";

type Props = {
  error: string;
};

export const EnableCard = ({ error }: Props) => {
  const { slug, slack } = useUser();
  const { trigger_token, trigger_token_expires_at } = slack ?? {};
  const [loading, setLoading] = useState(slack?.status === "SYNCING");
  const router = useRouter();

  const isEnabled = slack?.status === "ENABLED";
  const isSyncing = slack?.status === "SYNCING";
  const isConnected = slack?.status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = () => {
    setLoading(true);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      scope: SLACK_SCOPES,
      user_scope: USER_SCOPES,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/slack`,
    });

    router.push(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  };

  const onDisconnect = async () => {
    if (!slack) return;
    await deleteIntegration({ integration: slack, source: "SLACK" });
  };

  useEffect(() => {
    if (trigger_token_expires_at && trigger_token_expires_at < new Date()) {
      onDisconnect();
    }

    if (error) {
      switch (error) {
        case "access_denied":
          toast.error("Access denied", { duration: 10000 });
          break;
        case "invalid_code":
          toast.error("Error: Invalid code", { duration: 10000 });
          break;
        case "already_connected":
          toast.error(
            "This Slack workspace is already connected to another account",
            { duration: 10000 },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/slack`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <Link
            href="https://docs.useconquest.com/integrations/slack"
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
          Connect your Slack community to get a complete overview of your
          members and community activity.
        </p>
        {(isEnabled || isSyncing) && !isExpired && (
          <ListSlackChannels loading={loading} setLoading={setLoading} />
        )}
      </CardContent>
    </Card>
  );
};
