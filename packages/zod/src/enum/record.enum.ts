import { z } from "zod";

export const RECORD = z.enum(["MEMBER", "COMPANY"]);

export type Record = z.infer<typeof RECORD>;
