import { z } from "zod";

export const TYPE = z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "MULTISELECT"]);

export type Type = z.infer<typeof TYPE>;
