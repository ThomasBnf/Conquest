import { client } from "@conquest/clickhouse/client";
import { MemberWithProfilesSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listMembersWithProfiles = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    const { ids } = input;
    const { workspace_id } = user;

    const result = await client.query({
      query: `
        SELECT 
          m.*,
          profile.id as "profile.id",
          profile.external_id as "profile.external_id",
          profile.attributes as "profile.attributes",
          profile.member_id as "profile.member_id",
          profile.workspace_id as "profile.workspace_id",
          profile.created_at as "profile.created_at",
          profile.updated_at as "profile.updated_at"
        FROM member m FINAL
        LEFT JOIN profile ON m.id = profile.member_id
        WHERE m.id IN (${ids.map((id) => `'${id}'`).join(",")}) 
        AND m.workspace_id = '${workspace_id}'
      `,
    });

    const { data } = await result.json();

    const membersMap = new Map();

    for (const member of data) {
      if (!member || typeof member !== "object") continue;

      const memberData = member as Record<string, unknown>;
      const memberId = memberData.id;

      if (!membersMap.has(memberId)) {
        const memberWithoutProfiles = { ...member, profiles: [] } as Record<
          string,
          unknown
        >;

        for (const key of Object.keys(memberWithoutProfiles)) {
          if (key.startsWith("profile.")) {
            delete memberWithoutProfiles[key];
          }
        }

        membersMap.set(memberId, memberWithoutProfiles);
      }

      if (
        memberData["profile.id"] &&
        memberData["profile.id"] !== "00000000-0000-0000-0000-000000000000"
      ) {
        const profile: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(memberData)) {
          if (key.startsWith("profile.")) {
            profile[key.substring(8)] = value;
          }
        }

        membersMap.get(memberId).profiles.push(profile);
      }
    }

    const members = Array.from(membersMap.values());
    return MemberWithProfilesSchema.array().parse(members);
  });
