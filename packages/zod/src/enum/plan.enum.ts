import { z } from "zod";

export const PLAN = z.enum(["EXPLORER", "ACTIVE", "CONTRIBUTOR", "AMBASSADOR"]);

export type Plan = z.infer<typeof PLAN>;
