"use client";

import { linkedinAPI } from "@/actions/linkedin/linkedinAPI";
import { oauth } from "@/actions/linkedin/oauth";
import { Linkedin } from "@/components/icons/Linkedin";
import { env } from "@/env.mjs";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  searchParams: {
    code: string | null;
  };
};

export default function Page({ searchParams: { code } }: Props) {
  const router = useRouter();

  const onInstall = async () => {
    // await linkedinAPI();
    router.push(
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=https://d9362cfb1ab6.ngrok.app/conquest/settings/integrations/linkedin&scope=r_dma_portability_3rd_party`,
    );
  };

  const onTest = async () => {
    await linkedinAPI();
  };

  const onAuth = () => {
    if (!code) return;
    oauth({ code, client_id: env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID });
  };

  useEffect(() => {
    if (code) {
      onAuth();
    }
  }, [code]);

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
            <Button onClick={onInstall}>Install</Button>
            <Button onClick={onTest}>Test</Button>
          </div>
        </CardHeader>
        <CardContent className="mb-0.5 p-0">
          <div className="p-4">
            <p className="font-medium text-base">Overview</p>
            <p className="text-balance text-muted-foreground">
              Connect your Linkedin account to automatically get comments on
              your posts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
