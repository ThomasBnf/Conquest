import type { APIAttachment } from "discord.js";
import { prisma } from "../../prisma";

type Props = {
  files: APIAttachment[];
  activity_id: string | undefined;
};

export const createFiles = async ({ files, activity_id }: Props) => {
  if (!files || !activity_id) return;

  const createdFiles = files.map((file) => ({
    title: file.filename,
    url: file.url,
    activity_id,
  }));

  await prisma.files.createMany({
    data: createdFiles,
  });
};
