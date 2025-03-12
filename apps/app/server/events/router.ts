import { router } from "../trpc";
import { deleteEvent } from "./deleteEvent";
import { getEvent } from "./getEvent";
import { listEvents } from "./listEvents";

export const eventsRouter = router({
  list: listEvents,
  get: getEvent,
  delete: deleteEvent,
});
