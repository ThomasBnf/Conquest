import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { NodeWebhook } from "@conquest/zod/schemas/node.schema";
import { replaceVariables } from "./replace-variables";

type Props = {
  node: NodeWebhook;
  member: MemberWithLevel;
};

export const webhook = async ({ node, member }: Props) => {
  const { url, body } = node;

  if (!url) throw new Error("No URL provided");

  const parsedBody = replaceVariables({ message: body, member });

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: parsedBody,
  });
};
