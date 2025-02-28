import { z } from "zod";

export const SOURCE = z.enum([
  "Api",
  "Manual",
  "Discord",
  "Discourse",
  "Github",
  "Linkedin",
  "Livestorm",
  "Slack",
]);

export type Source = z.infer<typeof SOURCE>;
