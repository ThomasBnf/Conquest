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

import type { Operator } from "@conquest/zod/filters.schema";

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

import type { RepeatOn } from "@conquest/zod/node.schema";

export const weekdays: RepeatOn[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const SCOPES =
  "channels:history,channels:join,channels:read,files:read,groups:history,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";

export const USER_SCOPES = "chat:write,im:write,channels:write";
