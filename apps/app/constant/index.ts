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

export const DISCORD_PERMISSIONS = "8590001152";
export const DISCORD_SCOPES = "bot";

export const LINKEDIN_SCOPES =
  "r_organization_social,r_organization_social_feed,rw_organization_admin";

export const LIVESTORM_SCOPES =
  "identity:read events:read webhook:read webhook:write";

export const SLACK_USER_SCOPES = "chat:write,im:write,channels:write";
export const SLACK_SCOPES =
  "channels:history,channels:join,channels:read,files:read,groups:history,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";
