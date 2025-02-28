import { getCompany } from "@conquest/clickhouse/companies/getCompany";
import { getLevelById } from "@conquest/clickhouse/levels/getLevelById";
import { listTags } from "@conquest/clickhouse/tags/listTags";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const exportMembers = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.array(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { members } = input;

    const tags = await listTags({ workspace_id });

    const transformMemberForExport = async (member: Member) => {
      const transformed: Record<string, string> = {};

      for (const [key, value] of Object.entries(member)) {
        if (key === "logs") continue;

        if (key === "level_id") {
          if (!value) {
            transformed[key] = "";
            continue;
          }

          const level = await getLevelById({ id: value as string });

          if (!level) {
            transformed[key] = "";
            continue;
          }

          transformed[key] = `${level?.number} • ${level?.name}`;
          continue;
        }

        if (key === "company_id") {
          if (!member.company_id) {
            transformed[key] = "";
            continue;
          }

          const company = await getCompany({ id: member.company_id });

          transformed[key] = company?.name ?? "";
          continue;
        }

        if (key === "custom_fields" && typeof value === "object") {
          transformed[key] = value ? JSON.stringify(value) : "";
          continue;
        }

        if (key === "tags" && Array.isArray(value)) {
          if (!value.length) {
            transformed[key] = "";
            continue;
          }
          const tagNames = value
            .map((tagId) => tags.find((t) => t.id === tagId)?.name)
            .filter(Boolean);
          transformed[key] = tagNames.join(", ");
          continue;
        }

        transformed[key] =
          value === null || value === undefined
            ? ""
            : Array.isArray(value)
              ? value.filter(Boolean).map(String).join(", ")
              : typeof value === "object"
                ? JSON.stringify(value)
                : String(value);
      }

      return transformed;
    };

    const transformedMembers = await Promise.all(
      members.map(transformMemberForExport),
    );
    return transformedMembers;
  });
