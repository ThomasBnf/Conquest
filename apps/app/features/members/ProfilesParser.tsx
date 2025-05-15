import { Separator } from "@conquest/ui/separator";
import {
  DiscordProfile,
  DiscourseProfile,
  GithubProfile,
  LivestormProfile,
  Profile,
  SlackProfile,
  TwitterProfile,
} from "@conquest/zod/schemas/profile.schema";
import { DiscordSection } from "./DiscordSection";
import { DiscourseSection } from "./DiscourseSection";
import { GithubSection } from "./GithubSection";
import { LivestormSection } from "./LivestormSection";
import { SlackSection } from "./SlackSection";
import { TwitterSection } from "./TwitterSection";

type Props = {
  profiles: Profile[] | undefined;
};

export const ProfilesParser = ({ profiles }: Props) => {
  if (!profiles?.length) return null;

  return (
    <>
      <div className="space-y-2 p-4">
        {profiles
          ?.sort((a, b) =>
            a.attributes.source.localeCompare(b.attributes.source),
          )
          .map((profile) => {
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
      </div>
      <Separator />
    </>
  );
};
