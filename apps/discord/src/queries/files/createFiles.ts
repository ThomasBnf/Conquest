import { prisma } from "@/lib/prisma";
import type { Attachment, Collection } from "discord.js";

type Props = {
  files: Collection<string, Attachment>;
  activity_id: string | undefined;
};

export const createFiles = async ({ files, activity_id }: Props) => {
  if (!activity_id) return;

  const createdFiles = Array.from(files.values()).map((file) => ({
    title: file.name,
    url: file.url,
    activity_id,
  }));

  await prisma.files.createMany({
    data: createdFiles,
  });
};
