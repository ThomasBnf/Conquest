import type {
  Operator,
  WhoOptions,
} from "@conquest/zod/schemas/filters.schema";
import type { LEVEL } from "@conquest/zod/schemas/level.schema";
import type { RepeatOn } from "@conquest/zod/schemas/node.schema";

export const COLORS = [
  { name: "Gray", hex: "#6E7B8B" },
  { name: "Blue", hex: "#0070f3" },
  { name: "Cyan", hex: "#00A8C1" },
  { name: "Green", hex: "#3FAB77" },
  { name: "Yellow", hex: "#F2B200" },
  { name: "Orange", hex: "#D88234" },
  { name: "Pink", hex: "#EB5756" },
  { name: "Red", hex: "#F38E82" },
];

export const OPERATORS: Operator[] = [
  "contains",
  "not_contains",
  ">",
  ">=",
  "equal",
  "not_equal",
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

export const DISCORD_PERMISSIONS = "268502016";
export const DISCORD_SCOPES = "bot+messages.read";

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
