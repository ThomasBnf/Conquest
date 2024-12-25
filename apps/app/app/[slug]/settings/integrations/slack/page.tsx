"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { AlertDialog } from "@/components/custom/alert-dialog";
import { Slack } from "@/components/icons/Slack";
import { SLACK_SCOPES, USER_SCOPES } from "@/constant";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ListSlackChannels } from "@/features/slack/list-slack-channels";
import { useListChannels } from "@/queries/hooks/useListChannels";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/src/components/dropdown-menu";
import { ScrollArea } from "@conquest/ui/src/components/scroll-area";
import { Separator } from "@conquest/ui/src/components/separator";
import { format } from "date-fns";
import { ChevronDown, CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { slack } = useUser();
  const { trigger_token, trigger_token_expires_at, installed_at } = slack ?? {};
  const { data: channels } = useListChannels();
  const { name } = slack?.details ?? {};

  const [open, setOpen] = useState(false);
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
    return toast.success("Slack disconnected");
  };

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 py-16">
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
              Connect your Slack workspace to automatically sync messages,
              collect member interactions, and send personalized direct messages
              through automated workflows.
            </p>
            {(slack?.status === "ENABLED" || slack?.status === "SYNCING") &&
              !isExpired && <ListSlackChannels />}
          </CardContent>
        </Card>
        {slack?.status === "CONNECTED" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-medium text-base">
                Connected workspace
              </CardTitle>
            </CardHeader>
            <CardContent className="mb-0.5">
              <div className=" flex items-end justify-between">
                <div>
                  <p className="font-medium">{name}</p>
                  {installed_at && (
                    <p className="text-muted-foreground">
                      Installed on {format(installed_at, "PP")}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <div className="size-2.5 rounded-full bg-green-500" />
                      <p>Connected</p>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                      <p>Disconnect {name} workspace</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="mb-2 font-medium">Imported Channels</p>
                <div className="space-y-1">
                  {channels?.map((channel) => (
                    <p key={channel.id}># {channel.name}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <AlertDialog
          title={`Disconnect ${name} workspace`}
          description="Slack integration will be removed from your workspace and all your data will be deleted."
          onConfirm={onDisconnect}
          open={open}
          setOpen={setOpen}
          buttonLabel="Disconnect"
        />
      </div>
    </ScrollArea>
  );
}
