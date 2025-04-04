import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Github } from "@conquest/ui/icons/Github";
import { Separator } from "@conquest/ui/separator";
import { GithubProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: GithubProfile;
};

export const GithubSection = ({ profile }: Props) => {
  const { login, ...fields } = profile.attributes;

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Github size={16} /> <p>Github</p>
          </div>
          <MenuProfile profile={profile} />
        </div>
        <FieldCard icon="User" label="Login">
          <EditableLink
            placeholder="No github profile"
            defaultValue={login}
            href={`https://github.com/${login}`}
            editable={false}
          />
        </FieldCard>
        {Object.entries(fields).map(([key, value]) => {
          const formattedKey = key.slice(0, 1).toUpperCase() + key.slice(1);
          if (!value) return null;

          return (
            <FieldCard key={key} icon="User" label={formattedKey}>
              <p className="h-full place-content-center truncate px-2">
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
