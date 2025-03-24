"use client";

import { LINKEDIN_SCOPES } from "@/constant/index";
import { useIntegration } from "@/context/integrationContext";
import { env } from "@conquest/env";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { useRouter } from "next/navigation";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { LinkedinForm } from "./linkedin-form";

type Props = {
  error: string;
};

export const LinkedInIntegration = ({ error }: Props) => {
  const { linkedin, setLoading } = useIntegration();
  const { name } = linkedin?.details ?? {};

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
        source="Linkedin"
        onEnable={onEnable}
      >
        <LinkedinForm />
      </EnableCard>
      <ConnectedCard integration={linkedin} name={name} />
    </div>
  );
};
