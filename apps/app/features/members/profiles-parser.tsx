import {
  DiscordProfile,
  DiscourseProfile,
  GithubProfile,
  LivestormProfile,
  Profile,
  SlackProfile,
  TwitterProfile,
} from "@conquest/zod/schemas/profile.schema";
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
            return (
              <DiscordSection
                key={profile.id}
                profile={profile as DiscordProfile}
              />
            );
          case "Discourse":
            return (
              <DiscourseSection
                key={profile.id}
                profile={profile as DiscourseProfile}
              />
            );
          case "Github":
            return (
              <GithubSection
                key={profile.id}
                profile={profile as GithubProfile}
              />
            );
          case "Livestorm":
            return (
              <LivestormSection
                key={profile.id}
                profile={profile as LivestormProfile}
              />
            );
          case "Slack":
            return (
              <SlackSection
                key={profile.id}
                profile={profile as SlackProfile}
              />
            );
          case "Twitter":
            return (
              <TwitterSection
                key={profile.id}
                profile={profile as TwitterProfile}
              />
            );
        }
      })}
    </>
  );
};
