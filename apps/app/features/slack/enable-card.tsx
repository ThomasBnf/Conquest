"use client";

import { SLACK_SCOPES, USER_SCOPES } from "@/constant";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListSlackChannels } from "./list-slack-channels";

export const EnableCard = () => {
  const { slack } = useUser();
  const { trigger_token, trigger_token_expires_at } = slack ?? {};

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

  if (slack?.status === "CONNECTED") return;

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
      </CardHeader>
      <CardContent className="mb-0.5">
        <p className="font-medium text-base">Overview</p>
        <p className="text-balance text-muted-foreground">
          Connect your Slack workspace to automatically sync messages, collect
          member interactions, and send personalized direct messages through
          automated workflows.
        </p>
        {(slack?.status === "ENABLED" || slack?.status === "SYNCING") &&
          !isExpired && <ListSlackChannels />}
      </CardContent>
    </Card>
  );
};
