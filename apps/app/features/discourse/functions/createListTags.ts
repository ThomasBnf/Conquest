import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import ky from "ky";
import { z } from "zod";

export const BadgeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  badge_type_id: z.number(),
});

const BadgeTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const ResponseSchema = z.object({
  badges: z.array(BadgeSchema),
  badge_types: z.array(BadgeTypeSchema),
});

export const createListTags = safeAction
  .metadata({
    name: "createListTags",
  })
  .schema(
    z.object({
      api_key: z.string(),
      community_url: z.string(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { api_key, community_url, workspace_id } }) => {
    const response = await ky
      .get(`${community_url}/admin/badges`, {
        headers: {
          "Api-Key": api_key,
          "Api-Username": "system",
          Accept: "application/json",
        },
      })
      .json<Record<string, unknown>[]>();

    const { badges } = ResponseSchema.parse(response);

    for (const badge of badges ?? []) {
      const { id, name, description, badge_type_id } = BadgeSchema.parse(badge);

      const getColor = () => {
        switch (badge_type_id) {
          case 1:
            return "#E7C200";
          case 2:
            return "#C0C0C0";
          case 3:
            return "#cd7f31";
          default:
            return "";
        }
      };

      await prisma.tag.create({
        data: {
          external_id: id.toString(),
          name,
          description,
          color: getColor(),
          source: "DISCOURSE",
          workspace_id,
        },
      });
    }
  });
