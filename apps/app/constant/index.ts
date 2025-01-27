import type {
  Operator,
  WhoOptions,
} from "@conquest/zod/schemas/filters.schema";
import type { RepeatOn } from "@conquest/zod/schemas/node.schema";

export const COLORS = [
  "#95999F",
  "#6E7B8B",
  "#00A8C1",
  "#3FAB77",
  "#F2B200",
  "#D88234",
  "#F38E82",
  "#EB5756",
];

export const OPERATORS: Operator[] = [
  "contains",
  "not_contains",
  "greater",
  "greater or equal",
  "equal",
  "not equal",
  "less or equal",
  "less",
  "empty",
  "not_empty",
];

export const WHO_OPTIONS: WhoOptions[] = ["who_did", "who_did_not"];

export const REPEAT_ON: RepeatOn[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEKDAYS = ["Mon", "Wed", "Fri", "Sun"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const ACTIVITY_COLORS = {
  0: "bg-gray-100",
  1: "bg-main-200",
  2: "bg-main-400",
  3: "bg-main-600",
  4: "bg-main-900",
} as const;

export const SLACK_ACTIVITY_TYPES = [
  {
    name: "Invitation",
    source: "SLACK" as const,
    key: "slack:invitation",
    weight: 7,
    deletable: false,
  },
  {
    name: "Write a post",
    source: "SLACK" as const,
    key: "slack:post",
    weight: 6,
    deletable: false,
  },
  {
    name: "Reply to post",
    source: "SLACK" as const,
    key: "slack:reply",
    weight: 5,
    deletable: false,
  },
  {
    name: "Join Slack community",
    source: "SLACK" as const,
    key: "slack:join",
    weight: 4,
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "SLACK" as const,
    key: "slack:reaction",
    weight: 0,
    deletable: false,
  },
];

export const DISCORD_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "DISCORD" as const,
    key: "discord:invite",
    weight: 7,
    deletable: false,
  },
  {
    name: "Write a post",
    source: "DISCORD" as const,
    key: "discord:post",
    weight: 6,
    deletable: false,
  },
  {
    name: "Reply to post",
    source: "DISCORD" as const,
    key: "discord:reply",
    weight: 5,
    deletable: false,
  },
  {
    name: "Join Discord community",
    source: "DISCORD" as const,
    key: "discord:join",
    weight: 4,
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "DISCORD" as const,
    key: "discord:reaction",
    weight: 0,
    deletable: false,
  },
];

export const DISCOURSE_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "DISCOURSE" as const,
    key: "discourse:invite",
    weight: 7,
    channels: [],
    deletable: false,
  },
  {
    name: "Post marked as solved",
    source: "DISCOURSE" as const,
    key: "discourse:solved",
    weight: 7,
    deletable: false,
  },
  {
    name: "Write a topic",
    source: "DISCOURSE" as const,
    key: "discourse:topic",
    weight: 6,
    deletable: false,
  },
  {
    name: "Reply to topic",
    source: "DISCOURSE" as const,
    key: "discourse:reply",
    weight: 5,
    deletable: false,
  },
  {
    name: "Join Discourse community",
    source: "DISCOURSE" as const,
    key: "discourse:join",
    weight: 4,
    deletable: false,
  },
  {
    name: "Login",
    source: "DISCOURSE" as const,
    key: "discourse:login",
    weight: 0,
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "DISCOURSE" as const,
    key: "discourse:reaction",
    weight: 0,
    deletable: false,
  },
];

export const LIVESTORM_ACTIVITY_TYPES = [
  {
    name: "Co-host a webinar",
    source: "LIVESTORM" as const,
    key: "livestorm:co-host",
    weight: 10,
    deletable: false,
  },
  {
    name: "Attend a webinar",
    source: "LIVESTORM" as const,
    key: "livestorm:attend",
    weight: 8,
    deletable: false,
  },
  {
    name: "Register for a webinar",
    source: "LIVESTORM" as const,
    key: "livestorm:register",
    weight: 5,
    deletable: false,
  },
];

export const LINKEDIN_ACTIVITY_TYPES = [
  {
    name: "Comment a post",
    source: "LINKEDIN" as const,
    key: "linkedin:comment",
    weight: 1,
    deletable: false,
  },
];

export const DISCORD_PERMISSIONS = "66560";
export const DISCORD_SCOPES = "bot";

export const LINKEDIN_SCOPES =
  "r_organization_social,r_organization_social_feed,rw_organization_admin";

export const LIVESTORM_SCOPES =
  "identity:read events:read webhook:read webhook:write";

export const SLACK_USER_SCOPES = "chat:write,im:write,channels:write";
export const SLACK_SCOPES =
  "channels:history,channels:join,channels:read,files:read,groups:history,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";
