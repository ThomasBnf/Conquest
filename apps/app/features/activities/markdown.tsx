import { emojiParser } from "@/helpers/emoji-parser";
import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DiscourseMention } from "./discourse/discourse-mention";
import { SlackMention } from "./slack/slack-mention";

type Props = {
  activity: ActivityWithMember;
  className?: string;
};

export const Markdown = ({ activity, className }: Props) => {
  const [show, setShow] = useState(false);

  const { message } = activity;

  const convertToJsx = (
    inputText: string,
  ): JSX.Element | (string | JSX.Element)[] => {
    // Reconstruire les balises <a> cassées
    const normalizedText = inputText.replace(
      /(<a[^>]+class="mention"[^>]+>@[^<]+?)[\r\n\s]+([^<]*?<\/a>)/gi,
      (_, start, end) => `${start}${end}`,
    );

    let result: (string | JSX.Element)[] = [normalizedText];

    // Discourse mention
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk
        .split(/(<a[^>]+class="mention"[^>]+>[^<]+<\/a>)/gi)
        .map((part) => {
          const mentionMatch = part.match(
            /<a[^>]+class="mention"[^>]+>@([^<]+)<\/a>/i,
          );
          if (mentionMatch) {
            const [, username] = mentionMatch;
            if (!username) return part;
            return <DiscourseMention key={username} username={username} />;
          }
          return part;
        });
    });

    result = result.map((chunk) =>
      typeof chunk === "string"
        ? chunk
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
        : chunk,
    );

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
                  "h-fit text-balance p-0 text-[#1264a3]",
                )}
              >
                {text || url}
              </Link>
            );
          }
          return part;
        });
    });

    // Link: <a href="url">text</a>
    result = result.flatMap((chunk) => {
      if (typeof chunk !== "string") return chunk;
      return chunk.split(/(<a href="[^>]+>.*?<\/a>)/g).map((part) => {
        if (!part.startsWith('<a href="')) return part;

        const urlMatch = part.match(/href="([^"]+)"/);
        const textMatch = part.match(/>(.+?)<\/a>/);

        if (urlMatch?.[1] && textMatch?.[1]) {
          return (
            <Link
              key={urlMatch[1]}
              href={urlMatch[1]}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "link" }),
                "h-fit text-balance p-0 text-[#1264a3]",
              )}
            >
              {textMatch[1]}
            </Link>
          );
        }

        return part;
      });
    });

    // Discourse emoji
    result = result.flatMap((chunk): (string | JSX.Element)[] => {
      if (typeof chunk !== "string") return [chunk];
      return chunk.split(/(<img[^>]*>)/g).map((part) => {
        const emojiMatch = part.match(/title="([^"]+)"/);
        if (emojiMatch) {
          const [, emoji] = emojiMatch;
          return emoji ?? part;
        }
        return part;
      });
    });

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
            <pre key={content} className="rounded border bg-muted p-2">
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
              className="rounded border bg-muted p-0.5 font-[550] text-[#C52B51] text-[13px]"
            >
              {content}
            </code>
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

  const words = message.split(" ").length;
  const truncatedMessage = message.slice(0, 100);
  const hasMoreThan100Words = words > 100;

  return (
    <div>
      <p
        className={cn(
          "whitespace-pre-wrap break-words",
          show ? "" : "line-clamp-3",
          className,
        )}
      >
        {convertToJsx(truncatedMessage)}
      </p>
      {hasMoreThan100Words && (
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
