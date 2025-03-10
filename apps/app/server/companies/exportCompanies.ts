import { listTags } from "@conquest/db/tags/listTags";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const exportCompanies = protectedProcedure
  .input(
    z.object({
      companies: CompanySchema.array(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { companies } = input;

    const tags = await listTags({ workspace_id });

    const transformCompanyForExport = async (
      company: z.infer<typeof CompanySchema>,
    ) => {
      const transformed: Record<string, string> = {};

      for (const [key, value] of Object.entries(company)) {
        if (key === "tags" && Array.isArray(value)) {
          const tagNames = value.map(
            (tag) => tags.find((t) => t.id === tag)?.name,
          );
          transformed[key] = tagNames.join(", ");
          continue;
        }

        transformed[key] = !value
          ? ""
          : Array.isArray(value)
            ? value.map(String).join(", ")
            : typeof value === "object"
              ? JSON.stringify(value)
              : String(value);
      }

      return transformed;
    };

    return companies.map(transformCompanyForExport);
  });
