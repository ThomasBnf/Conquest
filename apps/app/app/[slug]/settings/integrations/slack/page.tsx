"use client";

import { DeleteDialog } from "@/components/custom/delete-dialog";
import { env } from "@/env.mjs";
import { deleteIntegration } from "@/features/integrations/actions/deleteIntegration";
import { oauthV2 } from "@/features/slack/actions/oauthV2";
import { installSlack } from "@/features/slack/queries/installSlack";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { useUser } from "context/userContext";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  const { slug, slack } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const scopes =
    "channels:history,channels:join,channels:read,files:read,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";

  const onStartInstall = () => {
    const baseUrl = "https://slack.com/oauth/v2/authorize";
    const clientId = `client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}`;
    const scopesParams = `scope=${scopes}`;
    const redirectURI = `redirect_uri=${encodeURIComponent(`${env.NEXT_PUBLIC_SLACK_REDIRECT_URI}/${slug}/settings/integrations/slack`)}`;

    router.push(`${baseUrl}?${clientId}&${scopesParams}&${redirectURI}`);
  };

  const onUninstall = async () => {
    if (!slack?.id) return;
    deleteIntegration({ id: slack.id });
    return toast.success("Slack disconnected");
  };

  useEffect(() => {
    if (code) oauthV2({ code, scopes });
  }, [code]);

  return (
    <div className="mx-auto max-w-3xl py-16">
      <Link
        href={`/${slug}/settings/integrations`}
        className={cn(
          buttonVariants({ variant: "link", size: "xs" }),
          "flex w-fit items-center gap-1 text-foreground",
        )}
      >
        <ArrowLeft size={16} />
        <p>Integrations</p>
      </Link>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Image src="/social/slack.svg" alt="Slack" width={24} height={24} />
          </div>
          <div>
            <p className="text-lg font-medium">Slack</p>
            <p className="text-muted-foreground">
              Synchronize your members with Slack
            </p>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted">
            <div className="flex items-center gap-4">
              <Link
                href="https://docs.useconquest.com/slack"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Documentation</p>
              </Link>
              <Link
                href="https://slack.com"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                slack.com
              </Link>
            </div>
            {slack?.installed_at ? (
              <DeleteDialog
                title="Disconnect Slack"
                description="Integrations will be removed from your workspace and all your data will be lost."
                onConfirm={onUninstall}
              >
                Uninstall
              </DeleteDialog>
            ) : (
              <Button
                loading={slack?.status === "SYNCING"}
                className={cn(buttonVariants({ variant: "default" }))}
                onClick={onStartInstall}
              >
                Install
              </Button>
            )}
          </div>
          <Separator />
          <div className="p-4">
            <p className="font-medium">Overview</p>
            <p className="text-muted-foreground">
              The Slack integration makes it easy to get messages, replies,
              reactions into Conquest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
