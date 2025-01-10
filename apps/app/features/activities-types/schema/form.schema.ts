import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const formSchema = z.object({
  source: SOURCE,
  name: z.string().min(1),
  key: z.string().min(1),
  weight: z.string().transform((val, ctx) => {
    const cleaned = val.replace(",", ".");
    const num = Number(cleaned);

    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weight must be a whole number (no decimals or commas)",
      });
      return z.NEVER;
    }

    if (!Number.isInteger(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weight must be a whole number (no decimals or commas)",
      });
      return z.NEVER;
    }

    if (num < 0 || num > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weight must be between 0 and 12",
      });
      return z.NEVER;
    }

    return num;
  }),
});

export type FormSchema = z.infer<typeof formSchema>;
