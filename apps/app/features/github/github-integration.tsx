"use client";

import { useIntegration } from "@/context/integrationContext";
import { env } from "@conquest/env";
import { Github } from "@conquest/ui/icons/Github";
import { useRouter } from "next/navigation";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { GithubForm } from "./github-form";

type Props = {
  error: string;
};

export const GithubIntegration = ({ error }: Props) => {
  const { github, setLoading } = useIntegration();
  const { repo } = github?.details ?? {};
  const router = useRouter();

  const onEnable = () => {
    setLoading(true);

    router.push(
      `https://github.com/apps/${env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/new`,
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Github />
        </div>
        <p className="font-medium text-lg">Github</p>
      </div>
      <EnableCard
        error={error}
        integration={github}
        docUrl="https://docs.useconquest.com/integrations/github"
        description="Connect your Github organization to get a complete overview of your members and community activity."
        source="Github"
        onEnable={onEnable}
      >
        <GithubForm />
      </EnableCard>
      <ConnectedCard integration={github} name={repo} />
    </div>
  );
};
