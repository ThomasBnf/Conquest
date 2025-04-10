import { z } from "zod";

export const REASON = z.enum(["NAME", "EMAIL", "USERNAME", "MANUAL"]);
export type Reason = z.infer<typeof REASON>;
