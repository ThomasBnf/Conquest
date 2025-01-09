import { PLAN as PLAN_ENUM } from "@prisma/client";
import { z } from "zod";

export const PLAN = z.nativeEnum(PLAN_ENUM);

export type Plan = z.infer<typeof PLAN>;
