import { ROLE as ROLE_ENUM } from "@prisma/client";
import { z } from "zod";

export const ROLE = z.nativeEnum(ROLE_ENUM);

export type Role = z.infer<typeof ROLE>;
