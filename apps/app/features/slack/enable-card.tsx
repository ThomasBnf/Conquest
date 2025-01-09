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
import { useEffect } from "react";
import { toast } from "sonner";
import { ListSlackChannels } from "./list-slack-channels";

type Props = {
  error: string;
};

export const EnableCard = ({ error }: Props) => {
  const { slug, slack } = useUser();
  const { trigger_token, trigger_token_expires_at } = slack ?? {};
  const isEnabled = slack?.status === "ENABLED";
  const isConnected = slack?.status === "CONNECTED";
  const isSyncing = slack?.status === "SYNCING";
  const router = useRouter();

  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = () => {
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

    const response = await deleteIntegration({
      integration: slack,
      source: "SLACK",
    });

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
            "This Slack workspace is already connected to another account",
            {
              duration: 10000,
            },
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
        {(!trigger_token || isExpired) && (
          <Button onClick={onEnable}>
            <CirclePlus size={16} />
            Enable
          </Button>
        )}
        {isEnabled && (
          <Button variant="destructive" onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </CardHeader>
      <CardContent className="mb-0.5">
        <p className="font-medium text-base">Overview</p>
        <p className="text-balance text-muted-foreground">
          Connect your Slack workspace to automatically sync messages, collect
          member interactions, and send personalized direct messages through
          automated workflows.
        </p>
        {(isEnabled || isSyncing) && !isExpired && <ListSlackChannels />}
      </CardContent>
    </Card>
  );
};
