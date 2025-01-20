"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { LINKEDIN_SCOPES } from "@/constant";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { LinkedinForm } from "@/features/linkedin/linkedin-form";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  error: string;
};

export const EnableCard = ({ error }: Props) => {
  const { slug, linkedin } = useUser();
  const { trigger_token, trigger_token_expires_at } = linkedin ?? {};
  const [loading, setLoading] = useState(linkedin?.status === "SYNCING");
  const router = useRouter();

  const isEnabled = linkedin?.status === "ENABLED";
  const isConnected = linkedin?.status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      scope: LINKEDIN_SCOPES,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/linkedin`,
    });

    router.push(
      `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
    );
  };

  const onDisconnect = async () => {
    if (!linkedin) return;
    await deleteIntegration({ integration: linkedin, source: "LINKEDIN" });
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
            "This Linkedin page is already connected to another account",
            {
              duration: 10000,
            },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/linkedin`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex flex-1 items-center justify-between">
          <Link
            href="https://docs.useconquest.com/linkedin"
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
          Connect your Linkedin account to automatically get comments on your
          posts.
        </p>
        {isEnabled && !isExpired && (
          <LinkedinForm loading={loading} setLoading={setLoading} />
        )}
      </CardContent>
    </Card>
  );
};
