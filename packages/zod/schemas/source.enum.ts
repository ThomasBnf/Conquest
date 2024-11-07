import { SOURCE as SOURCE_ENUM } from "@prisma/client";
import { z } from "zod";

export const SOURCE = z.nativeEnum(SOURCE_ENUM);

export type Source = z.infer<typeof SOURCE>;
