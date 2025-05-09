import { Label } from "@conquest/ui/label";
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
  return (
    <div className="space-y-4 p-4">
      <Label className="text-base">Profiles</Label>
      <div className="space-y-2">
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
      </div>
    </div>
  );
};
