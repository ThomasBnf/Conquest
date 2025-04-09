import { z } from "zod";

export const STATE = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type State = z.infer<typeof STATE>;
