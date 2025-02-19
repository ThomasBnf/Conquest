import { SourceBadge } from "@/components/badges/source-badge";
import { parseSlackMessage } from "@/helpers/parse-slack-message";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ActivityMenu } from "../activity-menu";
import { SlackMention } from "./slack-mention";

type Props = {
  activity: ActivityWithType;
  member: Member | null | undefined;
  channel: Channel | null | undefined;
};

const transformMentions = (children: React.ReactNode) => {
  const mentionRegex = /<@([A-Z0-9]+)>/g;

  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return child
        .split(mentionRegex)
        .map((part, index) =>
          index % 2 === 1 ? <SlackMention key={part} slackId={part} /> : part,
        );
    }
    return child;
  });
};

export const SlackMessage = ({ activity, member, channel }: Props) => {
  const { external_id, message, created_at } = activity;
  const { source } = activity.activity_type;

  const { avatar_url, first_name, last_name } = member ?? {};

  const { data: permalink, failureReason } = trpc.slack.getPermaLink.useQuery({
    channel_id: channel?.external_id,
    message_ts: external_id,
  });

  console.log(failureReason);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-5">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
              {last_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {first_name} {last_name}
            </span>{" "}
            sent message
            <span className="font-medium text-foreground">
              {" "}
              in #{channel?.name}
            </span>
          </p>
          <SourceBadge source={source} transparent onlyIcon />
          <p className="text-muted-foreground">{format(created_at, "HH:mm")}</p>
        </div>
        <ActivityMenu activity={activity} href={permalink} />
      </div>
      <div className="mt-2 ml-7 rounded-md border p-3">
        <ReactMarkdown
          className="whitespace-pre-wrap"
          components={{
            p: ({ children }) => <p>{transformMentions(children)}</p>,
            li: ({ children }) => <li>{transformMentions(children)}</li>,
            a: ({ node, ...props }) => (
              <a
                {...props}
                className=" text-[#1264a3] transition-colors hover:text-[#094C8C] hover:underline"
              >
                {props.children}
              </a>
            ),
          }}
        >
          {parseSlackMessage(message)}
        </ReactMarkdown>
      </div>
    </div>
  );
};
