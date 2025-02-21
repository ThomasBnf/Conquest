import { router } from "../trpc";
import { deleteEvent } from "./deleteEvent";
import { listEvents } from "./listEvents";

export const eventsRouter = router({
  deleteEvent,
  listEvents,
});
