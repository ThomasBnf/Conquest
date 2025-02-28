import { listEvents as _listEvents } from "@conquest/clickhouse/events/listEvents";
import { protectedProcedure } from "../trpc";

export const listEvents = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    return _listEvents({ workspace_id });
  },
);
