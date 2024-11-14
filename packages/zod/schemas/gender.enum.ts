import { z } from "zod";
import { GENDER as GENDER_ENUM } from "../../database/src";

export const GENDER = z.nativeEnum(GENDER_ENUM);

export type Gender = z.infer<typeof GENDER>;
