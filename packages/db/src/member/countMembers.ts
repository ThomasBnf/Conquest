import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { prisma } from "../prisma";

type Props = {
  search: string;
  groupFilters: GroupFilters;
  workspaceId: string;
};

export const countMembers = async ({
  search,
  groupFilters,
  workspaceId,
}: Props) => {
  const { operator } = groupFilters;
  // const filterConditions = getFilters({ groupFilters });

  const count = await prisma.member.count({
    where: {
      workspaceId,
      isStaff: false,
      OR: [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          primaryEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
        // {
        //   profiles: {
        //     some: {
        //       source: "Github",
        //       login: {
        //         contains: search,
        //         mode: "insensitive",
        //       },
        //     },
        //   },
        // },
      ],
    },
  });

  return count;
};
