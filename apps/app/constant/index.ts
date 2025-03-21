import type {
  Operator,
  WhoOptions,
} from "@conquest/zod/schemas/filters.schema";
import type { LEVEL } from "@conquest/zod/schemas/level.schema";
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
  ">",
  ">=",
  "equal",
  "not equal",
  "<=",
  "<",
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
  2: "bg-main-500",
  3: "bg-main-700",
  4: "bg-black",
} as const;

export const EUROPEAN_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

export const DISCORD_PERMISSIONS = "66560";
export const DISCORD_SCOPES = "bot";

export const LINKEDIN_SCOPES =
  "r_organization_social,r_organization_social_feed,rw_organization_admin";

export const LIVESTORM_SCOPES =
  "identity:read events:read webhook:read webhook:write";

export const SLACK_SCOPES =
  "channels:history,channels:join,channels:read,files:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";
export const SLACK_USER_SCOPES = "chat:write,im:write,channels:write";

export const LEVELS: LEVEL[] = [
  { number: 1, name: "Explorer III", from: 1, to: 4 },
  { number: 2, name: "Explorer II", from: 5, to: 9 },
  { number: 3, name: "Explorer I", from: 10, to: 19 },
  { number: 4, name: "Active III", from: 20, to: 39 },
  { number: 5, name: "Active II", from: 40, to: 79 },
  { number: 6, name: "Active I", from: 80, to: 149 },
  { number: 7, name: "Contributor III", from: 150, to: 249 },
  { number: 8, name: "Contributor II", from: 250, to: 399 },
  { number: 9, name: "Contributor I", from: 400, to: 599 },
  { number: 10, name: "Ambassador III", from: 600, to: 899 },
  { number: 11, name: "Ambassador II", from: 900, to: 1299 },
  { number: 12, name: "Ambassador I", from: 1300, to: null },
];

export const DISCOURSE_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "Discourse" as const,
    key: "discourse:invite",
    points: 7,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Post marked as solved",
    source: "Discourse" as const,
    key: "discourse:solved",
    points: 7,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Write a topic",
    source: "Discourse" as const,
    key: "discourse:topic",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply to topic",
    source: "Discourse" as const,
    key: "discourse:reply",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "Discourse" as const,
    key: "discourse:reaction",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Login",
    source: "Discourse" as const,
    key: "discourse:login",
    points: 0,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const DISCORD_ACTIVITY_TYPES = [
  {
    name: "Create a thread",
    source: "Discord" as const,
    key: "discord:thread",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply to a thread",
    source: "Discord" as const,
    key: "discord:reply_thread",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Write a message",
    source: "Discord" as const,
    key: "discord:message",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply to message",
    source: "Discord" as const,
    key: "discord:reply",
    points: 4,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "Discord" as const,
    key: "discord:reaction",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const GITHUB_ACTIVITY_TYPES = [
  {
    name: "Create a pull request",
    source: "Github" as const,
    key: "github:pr",
    points: 9,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Create an issue",
    source: "Github" as const,
    key: "github:issue",
    points: 4,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Create a comment",
    source: "Github" as const,
    key: "github:comment",
    points: 4,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Starred a repository",
    source: "Github" as const,
    key: "github:star",
    points: 2,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const LIVESTORM_ACTIVITY_TYPES = [
  {
    name: "Co-host a webinar",
    source: "Livestorm" as const,
    key: "livestorm:co-host",
    points: 10,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Attend a webinar",
    source: "Livestorm" as const,
    key: "livestorm:attend",
    points: 8,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Register for a webinar",
    source: "Livestorm" as const,
    key: "livestorm:register",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const LINKEDIN_ACTIVITY_TYPES = [
  {
    name: "Comment a post",
    source: "Linkedin" as const,
    key: "linkedin:comment",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const SLACK_ACTIVITY_TYPES = [
  {
    name: "Message",
    source: "Slack" as const,
    key: "slack:message",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply",
    source: "Slack" as const,
    key: "slack:reply",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reaction",
    source: "Slack" as const,
    key: "slack:reaction",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
];
