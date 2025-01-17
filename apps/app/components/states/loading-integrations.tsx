import { useUser } from "@/context/userContext";
import { Loader } from "@conquest/ui/loader";
import { Discord } from "../icons/Discord";
import { Discourse } from "../icons/Discourse";
import { Linkedin } from "../icons/Linkedin";
import { Livestorm } from "../icons/Livestorm";
import { Slack } from "../icons/Slack";

export const LoadingIntegrations = () => {
  const { discord, discourse, linkedin, livestorm, slack } = useUser();

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
              <Loader className="ml-auto size-4" />
            </div>
          ),
      )}
    </div>
  );
};
