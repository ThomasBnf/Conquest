import { trpc } from "@/server/client";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import type { Source } from "@conquest/zod/enum/source.enum";
import { Loader2 } from "lucide-react";

type IconComponent =
  | typeof Discord
  | typeof Discourse
  | typeof Github
  | typeof Linkedin
  | typeof Livestorm
  | typeof Slack;

const INTEGRATIONS: Array<{ source: Source; Icon: IconComponent }> = [
  { source: "Discord", Icon: Discord },
  { source: "Discourse", Icon: Discourse },
  { source: "Github", Icon: Github },
  { source: "Linkedin", Icon: Linkedin },
  { source: "Livestorm", Icon: Livestorm },
  { source: "Slack", Icon: Slack },
];

export const LoadingIntegrations = () => {
  const integrationQueries = INTEGRATIONS.map(({ source }) =>
    trpc.integrations.bySource.useQuery({ source }),
  );

  const syncingIntegrations = integrationQueries
    .map((query, index) => ({
      ...query,
      ...INTEGRATIONS[index],
    }))
    .filter(({ data }) => data?.status === "SYNCING");

  return (
    <div>
      {syncingIntegrations.map(({ data, Icon }) => (
        <div
          key={data!.id}
          className="flex h-10 items-center gap-2 border-t bg-background px-4 text-sm"
        >
          {Icon && <Icon size={16} />}
          <p>Collecting data</p>
          <Loader2
            size={16}
            className="ml-auto animate-spin text-muted-foreground"
          />
        </div>
      ))}
    </div>
  );
};
