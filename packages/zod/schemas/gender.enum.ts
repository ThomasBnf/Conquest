import { z } from "zod";

export const GENDER = z.enum(["MALE", "FEMALE", "OTHER"]);

export type Gender = z.infer<typeof GENDER>;
