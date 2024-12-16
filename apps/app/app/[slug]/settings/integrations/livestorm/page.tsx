"use client";

import { createIntegration } from "@/actions/integrations/createIntegration";
import { Livestorm } from "@/components/icons/Livestorm";
import { useUser } from "@/context/userContext";
import { InstallForm } from "@/features/livestorm/install-form";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { createActivitiesTypes } from "@/actions/slack/createActivitiesTypes";
import { LIVESTORM_ACTIVITY_TYPES } from "@/constant";

export default function Page() {
  const { livestorm } = useUser();
  const [loading, setLoading] = useState(false);

  const onInstall = async () => {
    setLoading(true);

    const integration = await createIntegration({
      details: {
        source: "LIVESTORM",
        api_key: "",
      },
      external_id: null,
    });

    const error = integration?.serverError;

    if (error) {
      setLoading(false);
      toast.error(error);
      return;
    }

    await createActivitiesTypes({
      activity_types: LIVESTORM_ACTIVITY_TYPES,
    });

    setLoading(false);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Livestorm />
        </div>
        <p className="font-medium text-lg">Livestorm</p>
      </div>
      <Card>
        <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
          <div className="flex w-full items-center justify-between">
            <Link
              href="https://doc.useconquest.com/livestorm"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "link", size: "xs" }),
                "flex w-fit items-center gap-2 text-foreground",
              )}
            >
              <ExternalLink size={15} />
              <p>Documentation</p>
            </Link>
            {!livestorm?.trigger_token && (
              <Button loading={loading} disabled={loading} onClick={onInstall}>
                Install
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="mb-0.5 p-0">
          <div className="p-4">
            <p className="font-medium text-base">Overview</p>
            <p className="text-balance text-muted-foreground">
              Connect your Livestorm workspace to automatically sync events.
            </p>
          </div>
          {livestorm?.trigger_token && <InstallForm />}
        </CardContent>
      </Card>
    </div>
  );
}
