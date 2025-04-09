import { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  members: Member[];
  finalMember?: Member;
};

export const getOldestMember = ({ members, finalMember }: Props) => {
  const oldestMember = members.reduce(
    (oldest, current) => {
      if (current.first_activity && !oldest?.first_activity) return current;
      if (!current.first_activity && oldest?.first_activity) return oldest;

      if (current.first_activity && oldest?.first_activity) {
        return current.first_activity < oldest.first_activity
          ? current
          : oldest;
      }

      if (!oldest?.created_at) return current;
      return current.created_at < oldest.created_at ? current : oldest;
    },
    null as Member | null,
  );

  return oldestMember ?? finalMember;
};
