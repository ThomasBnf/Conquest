import { z } from "zod";

export const PLAN = z.enum(["BASIC", "PREMIUM", "PRO"]);

export type Plan = z.infer<typeof PLAN>;
