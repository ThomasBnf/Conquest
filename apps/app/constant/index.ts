export const colors = [
  "#95999F",
  "#6E7B8B",
  "#00A8C1",
  "#3FAB77",
  "#F2B200",
  "#D88234",
  "#F38E82",
  "#EB5756",
];

import type { Operator } from "@conquest/zod/schemas/filters.schema";

export const OPERATORS: Operator[] = [
  "contains",
  "not_contains",
  "greater",
  "greater or equal",
  "equal",
  "not equal",
  "less or equal",
  "less",
];

import type { RepeatOn } from "@conquest/zod/schemas/node.schema";

export const weekdays: RepeatOn[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const SLACK_SCOPES =
  "channels:history,channels:join,channels:read,files:read,groups:history,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";

export const USER_SCOPES = "chat:write,im:write,channels:write";

export const WEEKDAYS = ["Mon", "Wed", "Fri", "Sun"] as const;
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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
    weight: 6,
    deletable: false,
  },
  {
    name: "Write a post",
    source: "SLACK" as const,
    key: "slack:post",
    weight: 4,
    deletable: false,
  },
  {
    name: "Reply to post",
    source: "SLACK" as const,
    key: "slack:reply",
    weight: 2,
    deletable: false,
  },
  {
    name: "Join Slack community",
    source: "SLACK" as const,
    key: "slack:join",
    weight: 1,
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

export const DISCOURSE_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "DISCOURSE" as const,
    key: "discourse:invite",
    weight: 6,
    deletable: false,
  },
  {
    name: "Post marked as solved",
    source: "DISCOURSE" as const,
    key: "discourse:solved",
    weight: 5,
    deletable: false,
  },
  {
    name: "Write a post",
    source: "DISCOURSE" as const,
    key: "discourse:post",
    weight: 4,
    deletable: false,
  },
  {
    name: "Reply to post",
    source: "DISCOURSE" as const,
    key: "discourse:reply",
    weight: 2,
    deletable: false,
  },
  {
    name: "Login",
    source: "DISCOURSE" as const,
    key: "discourse:login",
    weight: 1,
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
    name: "Attend event",
    source: "LIVESTORM" as const,
    key: "livestorm:attend",
    weight: 6,
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
  {
    name: "Like a post",
    source: "LINKEDIN" as const,
    key: "linkedin:like",
    weight: 0,
    deletable: false,
  },
];

export const LINKEDIN_SCOPES =
  "r_organization_followers,r_organization_social,r_organization_social_feed,r_basicprofile,rw_organization_admin";

export const LIVESTORM_SCOPES =
  "identity:read events:read webhook:read webhook:write";
