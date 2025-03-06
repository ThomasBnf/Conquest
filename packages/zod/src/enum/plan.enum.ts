import { z } from "zod";

export const PLAN = z.enum(["BASIC", "PREMIUM", "BUSINESS", "ENTERPRISE"]);

export type Plan = z.infer<typeof PLAN>;
