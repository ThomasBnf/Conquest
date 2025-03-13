import { listEvents as _listEvents } from "@conquest/db/events/listEvents";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listEvents = protectedProcedure
  .input(
    z.object({
      source: SOURCE,
    }),
  )
  .query(async ({ ctx: { user }, input: { source } }) => {
    const { workspace_id } = user;

    return _listEvents({ source, workspace_id });
  });
