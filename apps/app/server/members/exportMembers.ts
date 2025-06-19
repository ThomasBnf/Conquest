import { getCompany } from "@conquest/db/company/getCompany";
import { getLevel } from "@conquest/db/level/getLevelById";
import { listTags } from "@conquest/db/tags/listTags";
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
    const { workspaceId } = user;
    const { members } = input;

    const tags = await listTags({ workspaceId });

    const transformMemberForExport = async (member: Member) => {
      const transformed: Record<string, string> = {};

      for (const [key, value] of Object.entries(member)) {
        if (key === "logs") continue;

        if (key === "levelId") {
          if (!value) {
            transformed[key] = "";
            continue;
          }

          const level = await getLevel({
            number: Number(value),
            workspaceId,
          });

          if (!level) {
            transformed[key] = "";
            continue;
          }

          transformed[key] = `${level?.number} • ${level?.name}`;
          continue;
        }

        if (key === "companyId") {
          if (!member.companyId) {
            transformed[key] = "";
            continue;
          }

          const company = await getCompany({ id: member.companyId });

          transformed[key] = company?.name ?? "";
          continue;
        }

        if (key === "customFields" && typeof value === "object") {
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
