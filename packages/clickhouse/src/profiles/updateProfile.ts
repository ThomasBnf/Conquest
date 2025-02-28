import type { ProfileAttributes } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  id: string;
  attributes?: Partial<ProfileAttributes>;
};

export const updateProfile = async ({ id, attributes }: Props) => {
  if (!attributes) return;

  await client.query({
    query: `
      ALTER TABLE profiles
      UPDATE
        attributes = '${JSON.stringify(attributes)}',
        updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
