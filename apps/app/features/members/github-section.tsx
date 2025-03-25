import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Github } from "@conquest/ui/icons/Github";
import {
  GithubProfileSchema,
  type Profile,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const GithubSection = ({ profiles }: Props) => {
  const profile = profiles?.find(
    (profile) => profile.attributes.source === "Github",
  );

  if (!profile) return null;

  const githubProfile = GithubProfileSchema.parse(profile);
  const { attributes } = githubProfile;
  const { source, login, ...fields } = attributes;

  return (
    <>
      <FieldCard icon={<Github size={14} />} label="Github">
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
            <p className="h-full place-content-center truncate px-2">{value}</p>
          </FieldCard>
        );
      })}
    </>
  );
};
