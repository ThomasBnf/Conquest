import { prisma } from "@/lib/prisma";

export type SlackFile = {
  id: string;
  title: string;
  name: string;
  mimetype: string;
  filetype: string;
  size: number;
  url_private: string;
  url_private_download: string;
  thumb_360?: string;
  thumb_480?: string;
  thumb_720?: string;
  thumb_800?: string;
  thumb_1024?: string;
  original_w?: number;
  original_h?: number;
  permalink: string;
};

type Props = {
  files: SlackFile[] | undefined;
  activity_id: string | undefined;
};

export const createFiles = async ({ files, activity_id }: Props) => {
  if (
    !files?.length ||
    files.map((file) => !file.url_private).includes(true) ||
    !activity_id
  )
    return;

  const createdFiles = files.map((file) => ({
    title: file.title,
    url: file.url_private,
    activity_id,
  }));

  await prisma.files.createMany({
    data: createdFiles,
  });
};
