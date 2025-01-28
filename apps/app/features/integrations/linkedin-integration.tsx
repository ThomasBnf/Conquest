"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { Linkedin } from "@/components/icons/Linkedin";
import { LINKEDIN_SCOPES } from "@/constant/index";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LinkedinForm } from "../linkedin/linkedin-form";
import { ConnectedCard } from "./connected-card";
import { EnableCard } from "./enable-card";
import { IntegrationHeader } from "./integration-header";

type Props = {
  error: string;
};

export const LinkedInIntegration = ({ error }: Props) => {
  const { linkedin } = useUser();
  const { name } = linkedin?.details ?? {};
  const [loading, setLoading] = useState(linkedin?.status === "SYNCING");
  const router = useRouter();

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

    const response = await deleteIntegration({
      integration: linkedin,
      source: "LINKEDIN",
    });
    const error = response?.serverError;

    if (error) return toast.error(error);
    return toast.success("LinkedIn disconnected");
  };

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
