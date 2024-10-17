"use client";

import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import type { ActivityWithContact } from "@conquest/zod/activity.schema";
import Link from "next/link";
import * as emoji from "node-emoji";
import { useMemo } from "react";
import { SlackUser } from "./slack-user";

type Props = {
  activity: ActivityWithContact;
};

export const Message = ({ activity }: Props) => {
  const { message, source, type } = activity.details;

  const processWord = (word: string, index: number): React.ReactNode => {
    if (type === "REACTION" && source === "SLACK") {
      return emoji.emojify(`:${word}:`);
    }

    if (word.startsWith("<") && word.endsWith(">") && source === "SLACK") {
      const isUrl = word.includes("https://");
      const isUser = word.includes("@");
      if (isUrl) {
        const attachment = word.slice(1, -1);
        const [url, title] = attachment.split("|");
        return (
          <Link
            key={index}
            href={url ?? ""}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "link" }),
              "p-0 h-fit text-main-500",
            )}
          >
            {title || url}
          </Link>
        );
      }
      if (isUser) {
        const slack_id = word.slice(2, -1);
        return <SlackUser key={index} slack_id={slack_id} />;
      }
      return word.slice(1, -1);
    }

    return word.replace("&amp;", "&");
  };

  const processedMessage = useMemo(() => {
    return message.split(/(\s+)/).map((part, index) => {
      if (/\s+/.test(part)) {
        return part;
      }
      return processWord(part, index);
    });
  }, [message, type, source]);

  return (
    <div className="text-muted-foreground text-sm whitespace-pre-wrap">
      {processedMessage}
    </div>
  );
};
