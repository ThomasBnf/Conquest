import { router } from "../trpc";
import { createContact } from "./createContact";
import { createEvent } from "./createEvent";

export const brevoRouter = router({
  createContact,
  createEvent,
});
