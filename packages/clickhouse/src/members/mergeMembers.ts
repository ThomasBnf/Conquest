import { prisma } from "@conquest/db/prisma";
import { getMemberMetrics } from "@conquest/trigger/tasks/getMemberMetrics";
import { Duplicate } from "@conquest/zod/schemas/duplicate.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";
import { getOldestMember } from "../helpers/getOldestMember";
import { listLevels } from "../levels/listLevels";
import { updateMember } from "./updateMember";

type Props = {
  duplicate?: Duplicate;
  members: Member[] | undefined;
  finalMember: Member | null;
};

export const mergeMembers = async ({
  duplicate,
  members,
  finalMember,
}: Props) => {
  if (!members || !finalMember) return;

  const { workspaceId } = finalMember;
  const allMembers = [...members, finalMember];

  const oldestMember = getOldestMember({ members: allMembers, finalMember });

  console.log("oldestMember", oldestMember);

  if (!oldestMember) return;

  const mergedEntries = Object.entries(finalMember).map(([key, value]) => {
    if (key === "id") {
      return [key, oldestMember.id];
    }

    if (key === "tags") {
      const allTags = allMembers.flatMap((m) => m.tags || []);
      return [key, [...new Set(allTags)]];
    }

    if (key === "source") {
      return [key, oldestMember.source];
    }

    if (key === "levelId") {
      return [key, null];
    }

    if (key === "pulse") {
      return [key, 0];
    }

    if (key === "firstActivity") {
      return [key, null];
    }

    if (key === "lastActivity") {
      return [key, null];
    }

    if (key === "createdAt") {
      return [key, oldestMember.createdAt];
    }

    if (key === "updatedAt") {
      return [key, oldestMember.updatedAt];
    }

    return [key, value];
  });

  console.log("mergedEntries", mergedEntries);

  const mergeMember = MemberSchema.parse(Object.fromEntries(mergedEntries));

  console.log("mergeMember", mergeMember);

  const otherMembers = allMembers.filter(
    (member) => member.id !== mergeMember.id,
  );

  const otherMembersIds = otherMembers.map((m) => `'${m.id}'`).join(", ");
  const allMembersIds = allMembers.map((m) => `'${m.id}'`).join(", ");

  await client.query({
    query: `
        ALTER TABLE activity
        UPDATE memberId = '${mergeMember.id}'
        WHERE memberId IN (${otherMembersIds}) AND workspaceId = '${workspaceId}'
      `,
  });

  console.log("activity updated");

  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE inviteTo = '${mergeMember.id}'
      WHERE inviteTo IN (${otherMembersIds}) AND workspaceId = '${workspaceId}'
    `,
  });

  console.log("inviteTo updated");

  const result = await client.query({
    query: `
        SELECT *
        FROM profile FINAL
        WHERE memberId IN (${otherMembersIds}) AND workspaceId = '${workspaceId}'
      `,
  });

  console.log("profile fetched");

  const { data } = await result.json();
  const profiles = ProfileSchema.array().parse(data);

  const profilesIds = profiles.map((p) => `'${p.id}'`).join(", ");

  if (profilesIds.length > 0) {
    await client.query({
      query: `
      ALTER TABLE profile
      DELETE WHERE id IN (${profilesIds})
      AND workspaceId = '${workspaceId}'
      `,
    });

    const profilesValues = profiles.map((profile) => ({
      ...profile,
      memberId: mergeMember.id,
      updatedAt: new Date(),
    }));

    await client.insert({
      table: "profile",
      values: profilesValues,
      format: "JSON",
    });
  }

  await updateMember({ ...mergeMember });

  console.log("member updated");

  await client.query({
    query: `
        ALTER TABLE member
        DELETE WHERE id IN (${otherMembersIds})
      `,
  });

  console.log("other members deleted");

  await client.query({
    query: `
        ALTER TABLE log
        DELETE WHERE memberId IN (${allMembersIds})
      `,
  });

  console.log("log deleted");

  const levels = await listLevels({ workspaceId });

  console.log("levels fetched");

  await getMemberMetrics.trigger(
    { levels, member: mergeMember },
    { metadata: { workspaceId } },
  );

  const memberIds = members.map((m) => m.id);

  if (duplicate) {
    await prisma.duplicate.update({
      where: { id: duplicate.id },
      data: { state: "APPROVED" },
    });
  } else {
    const duplicates = await prisma.duplicate.findMany({
      where: {
        workspaceId,
      },
    });

    const filteredDuplicates = duplicates.filter((duplicate) =>
      duplicate.memberIds.some((id) => memberIds.includes(id)),
    );

    if (filteredDuplicates.length > 0) {
      await prisma.duplicate.deleteMany({
        where: { id: { in: filteredDuplicates.map((d) => d.id) } },
      });
    }
  }

  return mergeMember;
};
