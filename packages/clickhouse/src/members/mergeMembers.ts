import { getMemberMetrics } from "@conquest/trigger/tasks/getMemberMetrics";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";
import { listLevels } from "../levels/listLevels";
import { updateMember } from "./updateMember";

type Props = {
  leftMember: Member;
  rightMember: Member;
};

export const mergeMembers = async ({ leftMember, rightMember }: Props) => {
  const isLeftOlder =
    leftMember.first_activity &&
    rightMember.first_activity &&
    leftMember.first_activity < rightMember.first_activity;

  const mergedEntries = Object.entries(leftMember).map(([key, value]) => {
    const rightValue = rightMember[key as keyof typeof rightMember];

    if (!value) {
      return [key, rightValue];
    }

    if (value && !rightValue) {
      return [key, value];
    }

    if (key === "source") {
      return [key, isLeftOlder ? value : rightValue];
    }

    if (key === "tags") {
      const leftTags = value as string[];
      const rightTags = rightValue as string[];

      return [key, [...leftTags, ...rightTags]];
    }

    if (key === "secondary_emails") {
      const leftSecondaryEmails = value as string[];
      const rightSecondaryEmails = rightValue as string[];

      return [key, [...leftSecondaryEmails, ...rightSecondaryEmails]];
    }

    if (key === "phones") {
      const leftPhones = value as string[];
      const rightPhones = rightValue as string[];

      return [key, [...leftPhones, ...rightPhones]];
    }

    if (key === "created_at") {
      return [key, isLeftOlder ? value : rightValue];
    }

    return [key, rightValue];
  });

  const mergedMember: Member = {
    ...Object.fromEntries(mergedEntries),
  };

  const { workspace_id } = mergedMember;

  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE member_id = '${mergedMember.id}'
      WHERE member_id = '${leftMember.id}' AND workspace_id = '${workspace_id}'
    `,
  });
  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE invite_to = '${mergedMember.id}'
      WHERE invite_to = '${leftMember.id}' AND workspace_id = '${workspace_id}'
    `,
  });

  const result = await client.query({
    query: `
      SELECT * FROM profile
      WHERE member_id = '${leftMember.id}' AND workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();
  const profiles = ProfileSchema.array().parse(data);

  for (const profile of profiles) {
    await client.insert({
      table: "profile",
      values: [
        {
          ...profile,
          member_id: mergedMember.id,
          workspace_id,
        },
      ],
      format: "JSON",
    });

    await client.query({
      query: "OPTIMIZE TABLE profile FINAL",
    });
  }

  await updateMember({ ...mergedMember });

  await client.query({
    query: `
      ALTER TABLE member
      DELETE WHERE id = '${leftMember.id}' AND workspace_id = '${workspace_id}'
    `,
  });

  await client.query({
    query: `
      ALTER TABLE log
      DELETE WHERE member_id = '${leftMember.id}' AND workspace_id = '${workspace_id}'
    `,
  });

  await client.query({
    query: `
      ALTER TABLE log
      DELETE WHERE member_id = '${rightMember.id}' AND workspace_id = '${workspace_id}'
    `,
  });

  const levels = await listLevels({ workspace_id });

  await getMemberMetrics.trigger(
    { levels, member: mergedMember },
    { metadata: { workspace_id } },
  );

  return { success: true };
};
