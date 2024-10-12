"use client";

import { oauthV2 } from "@/actions/slack/auth/oauthV2";
import { runSlack } from "@/actions/slack/runSlack";
import { useUser } from "@/context/userContext";
import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { slug, user } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const getAccessToken = async () => {
    if (code) {
      const auth = await oauthV2({ code });
      if (auth) {
        router.push(`/${slug}/settings/integrations/slack`);
      }
    }
  };

  useEffect(() => {
    getAccessToken();
  }, [code]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col py-16">
      <Link
        href={`/${slug}/settings/integrations`}
        className={cn(
          buttonVariants({ variant: "link", size: "xs" }),
          "flex w-fit items-center justify-start gap-1 text-foreground",
        )}
      >
        <ArrowLeft size={16} />
        <p>Integrations</p>
      </Link>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-fit rounded-md border p-3">
            <Image src="/social/slack.svg" alt="Slack" width={24} height={24} />
          </div>
          <div>
            <p className="text-lg font-medium leading-tight">Slack</p>
            <p className="text-muted-foreground">
              Synchronize your contacts with Slack
            </p>
          </div>
        </div>
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href=""
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center justify-start gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Documentation</p>
              </Link>
              <Link
                href="https://slack.com"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center justify-start gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Website</p>
              </Link>
            </div>
            <Link
              href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=channels:history,channels:read,files:read,reactions:read,users.profile:read,users:read,users:read.email,team:read,groups:read`}
              className={cn(
                buttonVariants({ variant: "default" }),
                user?.workspace.slack_token && "pointer-events-none opacity-50",
              )}
            >
              Enable
            </Link>
          </div>
          <div className="mt-4">
            <p className="font-medium">Overview</p>
            <p className="text-muted-foreground">
              The Slack integration makes it easy to get messages, replies,
              reactions into Conquest.
            </p>
            <Button onClick={() => runSlack()}>Run Slack</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
