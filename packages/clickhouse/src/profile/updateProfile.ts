import {
  type Profile,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = { id: string } & Partial<Profile>;

export const updateProfile = async (props: Props) => {
  await client.insert({
    table: "profile",
    values: [
      {
        ...props,
        updatedAt: new Date(),
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE id = '${props.id}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  return ProfileSchema.parse(data[0]);
};
