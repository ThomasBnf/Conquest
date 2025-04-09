import { z } from "zod";

export const REASON = z.enum(["NAME", "EMAIL", "USERNAME"]);
export type Reason = z.infer<typeof REASON>;
