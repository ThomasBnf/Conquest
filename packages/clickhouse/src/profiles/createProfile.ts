import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  externalId?: string | null;
  attributes: ProfileAttributes;
  memberId: string;
  createdAt?: Date;
  workspaceId: string;
};

export const createProfile = async ({
  externalId,
  attributes,
  memberId,
  createdAt,
  workspaceId,
}: Props) => {
  const id = uuid();

  await client.insert({
    table: "profile",
    values: [
      {
        id,
        externalId,
        attributes,
        memberId,
        createdAt: format(createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
        workspaceId,
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE id = '${id}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  return ProfileSchema.parse(data[0]);
};
