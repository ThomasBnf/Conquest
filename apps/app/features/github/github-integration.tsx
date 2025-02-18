"use client";

import { Github } from "@/components/icons/Github";
import { SkeletonIntegration } from "@/components/states/skeleton-integration";
import { trpc } from "@/server/client";
import { env } from "@conquest/env";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GithubForm } from "../github/github-form";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";

type Props = {
  error: string;
};

export const GithubIntegration = ({ error }: Props) => {
  const { data, isLoading } = trpc.integrations.getIntegrationBySource.useQuery(
    { source: "GITHUB" },
  );
  const github = data ? GithubIntegrationSchema.parse(data) : null;
  const { status, details } = github ?? {};
  const { name } = details ?? {};

  const [loading, setLoading] = useState(status === "SYNCING");

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.deleteIntegration.useMutation({
    onSuccess: () => {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "GITHUB",
      });
      toast.success("Github disconnected");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onEnable = () => {
    setLoading(true);
    const params = new URLSearchParams({
      client_id: env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/github`,
      scope: "repo,user",
    });

    router.push(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  };

  const onDisconnect = async () => {
    if (!github) return;
    await mutateAsync({ integration: github });
  };

  if (isLoading) return <SkeletonIntegration />;

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
        loading={loading}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
      >
        <GithubForm loading={loading} setLoading={setLoading} />
      </EnableCard>
      <ConnectedCard
        integration={github}
        name={name}
        onDisconnect={onDisconnect}
      />
    </div>
  );
};
