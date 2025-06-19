import { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  members: Member[];
  finalMember?: Member;
};

export const getOldestMember = ({ members, finalMember }: Props) => {
  const oldestMember = members.reduce(
    (oldest, current) => {
      if (current.firstActivity && !oldest?.firstActivity) return current;
      if (!current.firstActivity && oldest?.firstActivity) return oldest;

      if (current.firstActivity && oldest?.firstActivity) {
        return current.firstActivity < oldest.firstActivity ? current : oldest;
      }

      if (!oldest?.createdAt) return current;
      return current.createdAt < oldest.createdAt ? current : oldest;
    },
    null as Member | null,
  );

  return oldestMember ?? finalMember;
};
