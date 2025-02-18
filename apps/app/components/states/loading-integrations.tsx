import { trpc } from "@/server/client";
import { Loader2 } from "lucide-react";
import { Discord } from "../icons/Discord";
import { Discourse } from "../icons/Discourse";
import { Linkedin } from "../icons/Linkedin";
import { Livestorm } from "../icons/Livestorm";
import { Slack } from "../icons/Slack";

export const LoadingIntegrations = () => {
  const { data: discord } = trpc.integrations.getIntegrationBySource.useQuery({
    source: "DISCORD",
  });

  const { data: discourse } = trpc.integrations.getIntegrationBySource.useQuery(
    {
      source: "DISCOURSE",
    },
  );

  const { data: linkedin } = trpc.integrations.getIntegrationBySource.useQuery({
    source: "LINKEDIN",
  });

  const { data: livestorm } = trpc.integrations.getIntegrationBySource.useQuery(
    {
      source: "LIVESTORM",
    },
  );

  const { data: slack } = trpc.integrations.getIntegrationBySource.useQuery({
    source: "SLACK",
  });
  return (
    <div>
      {[
        { integration: discord, Icon: Discord },
        { integration: discourse, Icon: Discourse },
        { integration: linkedin, Icon: Linkedin },
        { integration: livestorm, Icon: Livestorm },
        { integration: slack, Icon: Slack },
      ].map(
        ({ integration, Icon }) =>
          integration?.status === "SYNCING" && (
            <div
              key={integration.id}
              className="flex h-10 items-center gap-2 border-t bg-background px-4 text-sm"
            >
              <Icon size={16} />
              <p>Collecting data</p>
              <Loader2
                size={16}
                className="ml-auto animate-spin text-muted-foreground"
              />
            </div>
          ),
      )}
    </div>
  );
};
