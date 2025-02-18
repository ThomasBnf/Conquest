"use client";

import { Linkedin } from "@/components/icons/Linkedin";
import { SkeletonIntegration } from "@/components/states/skeleton-integration";
import { LINKEDIN_SCOPES } from "@/constant/index";
import { trpc } from "@/server/client";
import { env } from "@conquest/env";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LinkedinForm } from "../linkedin/linkedin-form";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";

type Props = {
  error: string;
};

export const LinkedInIntegration = ({ error }: Props) => {
  const { data, isLoading } = trpc.integrations.getIntegrationBySource.useQuery(
    { source: "LINKEDIN" },
  );
  const linkedin = data ? LinkedInIntegrationSchema.parse(data) : null;
  const { status, details } = linkedin ?? {};
  const { name } = details ?? {};

  const [loading, setLoading] = useState(status === "SYNCING");

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.deleteIntegration.useMutation({
    onSuccess: () => {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "LINKEDIN",
      });
      toast.success("LinkedIn disconnected");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onEnable = () => {
    setLoading(true);
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
    await mutateAsync({ integration: linkedin });
  };

  if (isLoading) return <SkeletonIntegration />;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Linkedin />
        </div>
        <p className="font-medium text-lg">LinkedIn</p>
      </div>
      <EnableCard
        error={error}
        integration={linkedin}
        docUrl="https://docs.useconquest.com/integrations/linkedin"
        description="Connect your LinkedIn organization page to sync and track members who engage with your posts."
        loading={loading}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
      >
        <LinkedinForm loading={loading} setLoading={setLoading} />
      </EnableCard>
      <ConnectedCard
        integration={linkedin}
        name={name}
        onDisconnect={onDisconnect}
      />
    </div>
  );
};
