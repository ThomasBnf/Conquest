import { Discord } from "@/components/icons/Discord";
import { Discourse } from "@/components/icons/Discourse";
import { Github } from "@/components/icons/Github";
import { Linkedin } from "@/components/icons/Linkedin";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";
import { Twitter } from "@/components/icons/Twitter";
import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import type { Row } from "@tanstack/react-table";

type Props = {
  row: Row<Member>;
};

export const ProfilesCell = ({ row }: Props) => {
  const { data, isLoading } = trpc.profiles.list.useQuery({
    member_id: row.original.id,
  });

  return (
    <div className="flex items-center gap-2 p-2">
      {isLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        data?.map((profile) => (
          <div key={profile.id} className="rounded-md border p-1">
            <ProfileIconParser profile={profile} />
          </div>
        ))
      )}
    </div>
  );
};

export const ProfileIconParser = ({ profile }: { profile: Profile }) => {
  switch (profile.attributes.source) {
    case "Discord":
      return <Discord size={16} />;
    case "Discourse":
      return <Discourse size={16} />;
    case "Github":
      return <Github size={16} />;
    case "Livestorm":
      return <Livestorm size={16} />;
    case "Linkedin":
      return <Linkedin size={16} />;
    case "Slack":
      return <Slack size={16} />;
    case "Twitter":
      return <Twitter size={16} />;
  }
};
