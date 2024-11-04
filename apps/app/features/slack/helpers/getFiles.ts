import type { GenericMessageEvent } from "@slack/web-api";

type SlackFile = NonNullable<GenericMessageEvent["files"]>[number];

export const getFiles = (files: SlackFile[] | undefined) => {
  return files?.map(({ title, url_private }) => ({
    title: title,
    url: url_private,
  }));
};
