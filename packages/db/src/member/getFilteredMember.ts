import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { getFilters } from "../helpers/getFilters";
import { prisma } from "../prisma";

type Props = {
  member: Member;
  groupFilters: GroupFilters;
};

export const getFilteredMember = async ({ member, groupFilters }: Props) => {
  const { operator } = groupFilters;
  const filterBy = await getFilters({ groupFilters });

  const hasMember = await prisma.member.count({
    where: {
      id: member.id,
      [operator]: filterBy,
    },
  });

  return hasMember > 0;
};
