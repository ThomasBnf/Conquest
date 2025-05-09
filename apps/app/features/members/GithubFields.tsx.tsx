import { FieldCard } from "@/components/editable/field-card";
import { Label } from "@conquest/ui/label";
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

  return (
    <>
      <div className="space-y-4 p-4">
        <Label className="text-base">Github attributes</Label>
        <div className="space-y-4">
          {Object.entries(githubProfile.attributes).map(([key, value]) => {
            const formattedKey = key.slice(0, 1).toUpperCase() + key.slice(1);
            if (!value) return null;

            return (
              <FieldCard key={key} label={formattedKey}>
                <p className="h-full place-content-center truncate px-2">
                  {value}
                </p>
              </FieldCard>
            );
          })}
        </div>
      </div>
      <Separator />
    </>
  );
};
