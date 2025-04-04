import { trpc } from "@/server/client";
import { ProfileIconParser } from "@/utils/profile-icon-parser";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: Member;
};

export const ProfilesCell = ({ member }: Props) => {
  const { data, isLoading } = trpc.profiles.list.useQuery({
    member_id: member.id,
  });

  return (
    <div className="flex items-center gap-1">
      {isLoading ? (
        <div className="flex items-center gap-1">
          <Skeleton className="size-7" />
          <Skeleton className="size-7" />
          <Skeleton className="size-7" />
        </div>
      ) : (
        data
          ?.sort((a, b) =>
            a.attributes.source.localeCompare(b.attributes.source),
          )
          .map((profile) => (
            <div
              key={profile.id}
              className="rounded-md border bg-background p-1"
            >
              <ProfileIconParser profile={profile} />
            </div>
          ))
      )}
    </div>
  );
};
