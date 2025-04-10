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

  const { workspace_id } = finalMember;
  const allMembers = [...members, finalMember];

  const oldestMember = getOldestMember({ members: allMembers, finalMember });

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

    if (key === "level_id") {
      return [key, null];
    }

    if (key === "pulse") {
      return [key, 0];
    }

    if (key === "first_activity") {
      return [key, null];
    }

    if (key === "last_activity") {
      return [key, null];
    }

    if (key === "created_at") {
      return [key, oldestMember.created_at];
    }

    if (key === "updated_at") {
      return [key, oldestMember.updated_at];
    }

    return [key, value];
  });

  const mergeMember = MemberSchema.parse(Object.fromEntries(mergedEntries));

  const otherMembers = allMembers.filter(
    (member) => member.id !== mergeMember.id,
  );

  const otherMembersIds = otherMembers.map((m) => `'${m.id}'`).join(", ");
  const allMembersIds = allMembers.map((m) => `'${m.id}'`).join(", ");

  await client.query({
    query: `
        ALTER TABLE activity
        UPDATE member_id = '${mergeMember.id}'
        WHERE member_id IN (${otherMembersIds}) AND workspace_id = '${workspace_id}'
      `,
  });

  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE invite_to = '${mergeMember.id}'
      WHERE invite_to IN (${otherMembersIds}) AND workspace_id = '${workspace_id}'
    `,
  });

  const result = await client.query({
    query: `
        SELECT * FROM profile
        WHERE member_id IN (${otherMembersIds}) AND workspace_id = '${workspace_id}'
      `,
  });

  const { data } = await result.json();
  const profiles = ProfileSchema.array().parse(data);

  const profilesValues = profiles.map((profile) => ({
    ...profile,
    member_id: mergeMember.id,
  }));

  await client.insert({
    table: "profile",
    values: profilesValues,
    format: "JSON",
  });

  await client.query({
    query: "OPTIMIZE TABLE profile FINAL",
  });

  await updateMember({ ...mergeMember });

  await client.query({
    query: `
        ALTER TABLE member
        DELETE WHERE id IN (${otherMembersIds})
      `,
  });

  await client.query({
    query: `
        ALTER TABLE log
        DELETE WHERE member_id IN (${allMembersIds})
      `,
  });

  const levels = await listLevels({ workspace_id });

  await getMemberMetrics.trigger(
    { levels, member: mergeMember },
    { metadata: { workspace_id: workspace_id } },
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
        workspace_id,
      },
    });

    const filteredDuplicates = duplicates.filter((duplicate) =>
      duplicate.member_ids.some((id) => memberIds.includes(id)),
    );

    if (filteredDuplicates.length > 0) {
      await prisma.duplicate.updateMany({
        where: { id: { in: filteredDuplicates.map((d) => d.id) } },
        data: { state: "APPROVED" },
      });
    }
  }

  return mergeMember;
};
