import { Member, MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { Message } from "@conquest/zod/schemas/node.schema";
import { SectionBlock } from "@slack/web-api";
import { replaceVariables } from "./replace-variables";

type Props = {
  message: Message;
  member: Member | MemberWithLevel;
  source?: "Slack" | "Discord";
};

export const plateToSlackBlocks = async ({
  message,
  member,
  source,
}: Props): Promise<SectionBlock[]> => {
  const processNode = async (node: Message[0]): Promise<string> => {
    if (!node.children || node.children.length === 0) return "";

    const processedChildren = await Promise.all(
      node.children.map(async (child) => {
        if (
          "type" in child &&
          (child.type === "mention" ||
            child.type === "mention_input" ||
            child.type === "emoji_input")
        ) {
          const value = child.value || "";
          return await replaceVariables({ message: value, member, source });
        }

        if ("text" in child && child.text !== undefined) {
          let text = await replaceVariables({
            message: child.text,
            member,
            source,
          });

          if (!text.trim()) return "";

          if (child.strikethrough) text = `~${text}~`;
          if (child.italic) text = `_${text}_`;
          if (child.bold) text = `*${text}*`;

          return text;
        }

        return "";
      }),
    );

    return processedChildren.join("");
  };

  const processedLines = await Promise.all(message.map(processNode));

  const filteredLines = processedLines.filter((line) => line !== null);

  const blocks: SectionBlock[] = [];
  let currentGroup: string[] = [];

  for (const line of filteredLines) {
    if (!line || line.trim() === "") {
      if (currentGroup.length > 0) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: currentGroup.join("\n"),
          },
        });
        currentGroup = [];
      }
      continue;
    }

    currentGroup.push(line);

    if (currentGroup.join("\n").length > 2500) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: currentGroup.join("\n"),
        },
      });
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: currentGroup.join("\n"),
      },
    });
  }

  return blocks;
};
