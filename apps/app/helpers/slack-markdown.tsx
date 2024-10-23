import { SlackMention } from "@/features/activities/slack/slack-mention";
import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { emojiParser } from "./emoji-parser";

type Props = {
  activity: ActivityWithMember;
};

export const SlackMarkdown = ({ activity }: Props) => {
  const [show, setShow] = useState(false);

  const slackActivity = ActivitySlackSchema.parse(activity.details);
  const { message } = slackActivity;

  const convertToJsx = (
    inputText: string,
  ): JSX.Element | (string | JSX.Element)[] => {
    let result: (string | JSX.Element)[] = [inputText.replace("&amp;", "&")];

    // Emoji: :emoji:
    result = result.flatMap((chunk): (string | JSX.Element)[] => {
      if (typeof chunk !== "string") return [chunk];
      return chunk.split(/(:[\w_+-]+:)/g).map((part) => {
        const emojiMatch = part.match(/^:([\w_+-]+):$/);
        if (emojiMatch) {
          const [, emojiName] = emojiMatch;
          return emojiParser(emojiName ?? "");
        }
        return part;
      });
    });

    // Bold: *text*
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(\*.+?\*)/g).map((part) => {
        if (part.match(/^\*.+?\*$/)) {
          const content = part.replace(/^\*(.+?)\*$/, "$1");
          return (
            <strong className="font-semibold" key={content}>
              {convertToJsx(content)}
            </strong>
          );
        }
        return part;
      });
    });

    // Italic: _text_
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(_[^_]+_)/g).map((part) => {
        if (part.match(/^_[^_]+_$/)) {
          const content = part.replace(/^_(.+)_$/, "$1");
          return <em key={content}>{convertToJsx(content)}</em>;
        }
        return part;
      });
    });

    // Strike-through: ~text~
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(~.+?~)/g).map((part) => {
        if (part.match(/^~.+?~$/)) {
          const content = part.replace(/^~(.+?)~$/, "$1");
          return <del key={content}>{convertToJsx(content)}</del>;
        }
        return part;
      });
    });

    // Code block: ```text```
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(```[^`]+```)/g).map((part) => {
        if (part.match(/^```[^`]+```$/)) {
          const content = part.slice(3, -3);
          return (
            <pre key={content} className="bg-muted p-2 border rounded">
              {content}
            </pre>
          );
        }
        return part;
      });
    });

    // Code: `text`
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(`[^`]+`)/g).map((part) => {
        if (part.match(/^`[^`]+`$/)) {
          const content = part.replace(/^`(.+)`$/, "$1");
          return (
            <code
              key={content}
              className="text-red-700 bg-muted border text-sm rounded px-0.5"
            >
              {content}
            </code>
          );
        }
        return part;
      });
    });

    // Link: <https://example.com|text>
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk
        .split(/(<(?:https?:\/\/[^|>]+)\|[^>]+>|<(?:https?:\/\/[^>]+)>)/g)
        .map((part) => {
          const linkMatch =
            part.match(/^<(https?:\/\/[^|>]+)\|([^>]+)>$/) ||
            part.match(/^<(https?:\/\/[^>]+)>$/);
          if (linkMatch) {
            const [, url, text] = linkMatch;
            return (
              <Link
                key={url}
                href={url ?? ""}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "p-0 h-fit leading-none text-[#1264a3]",
                )}
              >
                {text || url}
              </Link>
            );
          }
          return part;
        });
    });

    // Mention: <@U01234567890|username>
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(<@[A-Z0-9]+(?:\|[^>]+)?>)/g).map((part) => {
        const mentionMatch = part.match(/^<@([A-Z0-9]+)(?:\|[^>]+)?>$/);
        if (mentionMatch) {
          const [, userId] = mentionMatch;
          return <SlackMention key={userId} slack_id={userId ?? ""} />;
        }
        return part;
      });
    });

    return result;
  };

  const lines = message.split("\n").length;

  return (
    <div>
      <p className={cn("whitespace-pre-wrap", show ? "" : "line-clamp-3")}>
        {convertToJsx(message)}
      </p>
      {lines > 2 && (
        <Button
          variant="secondary"
          size="xs"
          onClick={() => setShow(!show)}
          className="mt-2 text-xs"
          classNameSpan="gap-1"
        >
          {show ? "Show less" : "Show more"}
          {show ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      )}
    </div>
  );
};
