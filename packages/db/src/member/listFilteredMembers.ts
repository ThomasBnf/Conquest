import { getFilters } from "@conquest/db/helpers/getFilters";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { FullMemberSchema } from "@conquest/zod/schemas/member.schema";
import { Prisma, prisma } from "../prisma";

type Props = {
  cursor: number | null | undefined;
  search: string;
  id: string;
  desc: boolean;
  groupFilters: GroupFilters;
  workspaceId: string;
};

export const listFilteredMembers = async ({
  cursor,
  search,
  id,
  desc,
  groupFilters,
  workspaceId,
}: Props) => {
  const { operator } = groupFilters;
  const filterBy = await getFilters({ groupFilters });

  const orderBy = orderByParser({
    id,
    desc,
    type: "members",
  }) as Prisma.MemberOrderByWithRelationInput[];

  const members = await prisma.member.findMany({
    where: {
      workspaceId,
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { primaryEmail: { contains: search, mode: "insensitive" } },
      ],
      [operator]: filterBy,
    },
    include: {
      profiles: true,
      company: {
        select: {
          name: true,
        },
      },
      level: {
        select: {
          name: true,
        },
      },
    },
    take: 50,
    skip: cursor ? cursor : 0,
    orderBy,
  });

  return FullMemberSchema.array().parse(members);
};
