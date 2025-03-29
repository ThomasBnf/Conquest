import { Profile } from "@conquest/zod/schemas/profile.schema";
import { DiscordSection } from "./discord-section";
import { DiscourseSection } from "./discourse-section";
import { GithubSection } from "./github-section";
import { LivestormSection } from "./livestorm-section";
import { SlackSection } from "./slack-section";
import { TwitterSection } from "./twitter-section";

type Props = {
  profiles: Profile[] | undefined;
};

export const ProfilesParser = ({ profiles }: Props) => {
  return (
    <>
      {profiles?.map((profile) => {
        const { source } = profile.attributes;

        switch (source) {
          case "Discord":
            return <DiscordSection profiles={profiles} />;
          case "Discourse":
            return <DiscourseSection profiles={profiles} />;
          case "Github":
            return <GithubSection profiles={profiles} />;
          case "Livestorm":
            return <LivestormSection profiles={profiles} />;
          case "Slack":
            return <SlackSection profiles={profiles} />;
          case "Twitter":
            return <TwitterSection profiles={profiles} />;
        }
      })}
    </>
  );
};
