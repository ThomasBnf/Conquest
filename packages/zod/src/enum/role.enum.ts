import { z } from "zod";

export const ROLE = z.enum(["STAFF", "ADMIN"]);
export type Role = z.infer<typeof ROLE>;
