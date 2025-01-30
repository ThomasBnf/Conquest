import { prisma } from "@conquest/db/prisma";
import type { Attachment, Collection } from "discord.js";

type CreateFilesParams = {
  files: Collection<string, Attachment>;
  activity_id: string | undefined;
};

export const createFiles = async ({
  files,
  activity_id,
}: CreateFilesParams) => {
  if (!activity_id) return;

  const fileData = files.map((file) => ({
    title: file.name,
    url: file.url,
    activity_id,
  }));

  for (const file of fileData) {
    await prisma.files.create({
      data: file,
    });
  }
};
