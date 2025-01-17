"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import Fuse from "fuse.js";

export const test = authAction
  .metadata({
    name: "test",
  })
  .action(async ({ ctx: { user } }) => {
    const workspace_id = user.workspace_id;

    const members = await prisma.members.findMany({
      where: {
        workspace_id,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        primary_email: true,
      },
    });

    const potentialDuplicates = members.map((member) => {
      const fuse = new Fuse(members, {
        keys: [
          { name: "first_name", weight: 2 },
          { name: "last_name", weight: 2 },
          { name: "primary_email", weight: 1 },
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
        findAllMatches: true,
        distance: 100,
        minMatchCharLength: 2,
      });

      const searchString = [
        member.first_name,
        member.last_name,
        member.primary_email,
      ]
        .filter(Boolean)
        .join(" ");

      const similarMembers = fuse
        .search(searchString)
        .filter(
          (result) =>
            result.score && result.score < 0.8 && result.item.id !== member.id,
        )
        .map((result) => ({
          originalMember: member,
          similarMember: result.item,
          similarity: result.score,
        }));

      console.log(similarMembers);

      return similarMembers;
    });

    const flattenedDuplicates = potentialDuplicates
      .flat()
      .filter((duplicate) => duplicate.similarity !== undefined);

    return flattenedDuplicates;
  });
