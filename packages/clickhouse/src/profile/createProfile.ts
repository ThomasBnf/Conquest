import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
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
  console.log("=== createProfile START ===");
  console.log("Input:", { externalId, attributes, memberId, workspaceId });

  const id = uuid();
  console.log("Generated ID:", id);

  console.log("Checking for existing profile...");
  const existingProfile = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE externalId = '${externalId}'
      AND workspaceId = '${workspaceId}'
    `,
    format: "JSON",
  });

  const { data: existingProfileData } = await existingProfile.json();
  console.log("Existing profiles found:", existingProfileData.length);
  console.log("Existing profiles data:", existingProfileData);

  if (existingProfileData.length > 0) {
    console.log("Profile already exists, updating...");
    await client.query({
      query: `
        ALTER TABLE profile
        UPDATE attributes = '${JSON.stringify(attributes)}'
        WHERE externalId = '${externalId}'
        AND workspaceId = '${workspaceId}'
      `,
    });
    console.log("Profile updated");
    return ProfileSchema.parse(existingProfileData[0]);
  }

  console.log("No existing profile found, creating new one...");
  await client.insert({
    table: "profile",
    values: [
      {
        id,
        externalId,
        attributes,
        memberId,
        createdAt,
        workspaceId,
      },
    ],
    format: "JSON",
  });
  console.log("New profile inserted");

  const result = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE id = '${id}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  console.log("=== createProfile END ===");
  return ProfileSchema.parse(data[0]);
};
