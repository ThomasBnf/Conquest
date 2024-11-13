import { STATUS as STATUS_ENUM } from "@conquest/prisma";
import { z } from "zod";

export const STATUS = z.nativeEnum(STATUS_ENUM);

export type Status = z.infer<typeof STATUS>;
