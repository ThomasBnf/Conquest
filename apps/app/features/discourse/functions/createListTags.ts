import { createTag } from "@/features/tags/actions/createTag";
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
      workspace_id: z.string().cuid(),
      token: z.string(),
    }),
  )
  .action(async ({ parsedInput: { workspace_id, token } }) => {
    const response = await ky
      .get("https://playground.lagrowthmachine.com/admin/badges", {
        headers: {
          "Api-Key": token,
          "Api-Username": "system",
          Accept: "application/json",
        },
      })
      .json<Record<string, unknown>[]>();

    const { badges, badge_types } = ResponseSchema.parse(response);
    console.log(badges, badge_types);

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

      await createTag({
        external_id: id.toString(),
        name,
        description,
        color: getColor(),
        source: "DISCOURSE",
      });
    }
  });
