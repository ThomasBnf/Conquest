import { GENDER as GENDER_ENUM } from "@prisma/client";
import { z } from "zod";

export const GENDER = z.nativeEnum(GENDER_ENUM);

export type Gender = z.infer<typeof GENDER>;
