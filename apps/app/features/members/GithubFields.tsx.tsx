import { FieldCard } from "@/components/editable/field-card";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { GithubProfile, Profile } from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const GithubFields = ({ profiles }: Props) => {
  const githubProfile = profiles?.find(
    (profile) => profile.attributes.source === "Github",
  ) as GithubProfile;

  if (!githubProfile) return null;
  const { source, login, ...rest } = githubProfile.attributes;

  return (
    <>
      <div className="space-y-4 p-4">
        {Object.entries(rest).map(([key, value]) => {
          const formattedKey = key.slice(0, 1).toUpperCase() + key.slice(1);
          if (!value) return null;

          return (
            <FieldCard key={key} label={formattedKey} className="group">
              <p
                className={cn(
                  "h-full px-2",
                  key !== "bio" && "place-content-center truncate",
                )}
              >
                {value}
              </p>
            </FieldCard>
          );
        })}
      </div>
      <Separator />
    </>
  );
};
