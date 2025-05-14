import { Github } from "@conquest/ui/icons/Github";
import { GithubProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: GithubProfile;
};

export const GithubSection = ({ profile }: Props) => {
  const { login } = profile.attributes;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded border bg-background">
          <Github size={16} />
        </div>
        <p>{login}</p>
        <MenuProfile href={`https://github.com/${login}`} profile={profile} />
      </div>
    </div>
  );
};
