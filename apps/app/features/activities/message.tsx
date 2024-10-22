"use client";

import { emojiParser } from "@/helpers/emoji-parser";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import type { ActivityWithContact } from "@conquest/zod/activity.schema";
import Link from "next/link";
import { useMemo } from "react";
import { SlackMention } from "./slack/slack-mention";
import { Reaction } from "./slack/slack-reaction";

type Props = {
  activity: ActivityWithContact;
};

export const Message = ({ activity }: Props) => {
  const { message, source, type } = activity.details;

  const processedMessage = useMemo(() => {
    const isReaction = type === "REACTION";
    const isSlack = source === "SLACK";
    const parts = message.split(/(<[^>]+>|\s+)/);

    return parts.map((part) => {
      if (!part) return null;

      switch (true) {
        case part.startsWith("<@"): {
          const userId = part.slice(2, -1);
          return <SlackMention slack_id={userId} />;
        }

        case part.startsWith("<"): {
          const [url, title] = part.slice(1, -1).split("|");
          if (!url) return null;

          return (
            <Link
              key={url}
              href={url}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "link" }),
                "p-0 h-fit leading-none text-[#1264a3]",
              )}
            >
              {title ?? url}
            </Link>
          );
        }

        case part.trim() === "":
          return " ";

        case part.startsWith(":") && part.endsWith(":"): {
          return emojiParser(part.slice(1, -1));
        }

        default: {
          let content = part;
          if (isReaction && isSlack) {
            return <Reaction activity={activity} content={content} />;
          }
          content = content
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
              String.fromCharCode(Number.parseInt(hex, 16)),
            )
            .replace(/&#(\d+);/g, (_, num) =>
              String.fromCharCode(Number.parseInt(num, 10)),
            );

          return content;
        }
      }
    });
  }, [message, source, type]);

  return <p className="whitespace-pre-wrap">{processedMessage}</p>;
};
