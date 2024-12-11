"use client";

import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { IntegrationCard } from "@/features/integrations/integration-card";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ChannelsList } from "@/features/slack/components/channels-list";
import { InstallButton } from "@/features/slack/components/install-button";
import { UninstallButton } from "@/features/slack/components/uninstall_button";

type Props = {
  searchParams: {
    code: string | null;
  };
};

export default function Page({ searchParams: { code } }: Props) {
  const { slack } = useUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Slack />
        </div>
        <p className="font-medium text-lg">Slack</p>
      </div>
      <IntegrationCard
        integration={slack}
        doc_url="https://doc.useconquest.com/slack"
        install_button={<InstallButton code={code} />}
        uninstall_button={<UninstallButton />}
      >
        {slack?.id && <ChannelsList />}
      </IntegrationCard>
    </div>
  );
}
