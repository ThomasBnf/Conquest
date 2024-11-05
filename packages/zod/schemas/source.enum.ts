import { z } from "zod";

export const SOURCE = z.enum(["API", "MANUAL", "SLACK", "DISCOURSE"]);

export type Source = z.infer<typeof SOURCE>;
