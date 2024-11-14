import { z } from "zod";
import { STATUS as STATUS_ENUM } from "../../database/src";

export const STATUS = z.nativeEnum(STATUS_ENUM);

export type Status = z.infer<typeof STATUS>;
