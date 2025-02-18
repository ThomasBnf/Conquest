import { router } from "../trpc";
import { deleteEvent } from "./deleteEvent";

export const eventsRouter = router({
  deleteEvent,
});
