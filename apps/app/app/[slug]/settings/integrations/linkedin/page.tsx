"use client";

import { Linkedin } from "@/components/icons/Linkedin";
import { LINKEDIN_SCOPES } from "@/constant";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ListOrganizations } from "@/features/linkedin/list-organizations";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { linkedin } = useUser();
  const { trigger_token, trigger_token_expires_at } = linkedin ?? {};

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    setLoading(true);

    const baseUrl = "https://www.linkedin.com/oauth/v2/authorization";
    const clientId = `client_id=${env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}`;
    const scopes = `scope=${LINKEDIN_SCOPES}`;
    const redirectUri =
      "redirect_uri=https://2e17b8a57252.ngrok.app/connect/linkedin";

    router.push(
      `${baseUrl}?response_type=code&${clientId}&${scopes}&${redirectUri}`,
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Linkedin />
        </div>
        <p className="font-medium text-lg">Linkedin</p>
      </div>
      <Card>
        <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
          <div className="flex flex-1 items-center justify-between">
            <Link
              href="https://doc.useconquest.com/linkedin"
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
          </div>
        </CardHeader>
        <CardContent className="mb-0.5">
          <p className="font-medium text-base">Overview</p>
          <p className="text-balance text-muted-foreground">
            Connect your Linkedin account to automatically get comments on your
            posts.
          </p>
          {linkedin?.status === "ENABLED" && !isExpired && (
            <ListOrganizations />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
