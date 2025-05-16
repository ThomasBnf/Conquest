import type { Profile } from "@conquest/zod/schemas/profile.schema";
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

  await client.query({
    query: "OPTIMIZE TABLE profile FINAL;",
  });
};
