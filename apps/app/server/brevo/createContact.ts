import { env } from "@conquest/env";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
export const createContact = protectedProcedure
  .input(
    z.object({
      user: UserSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { user } = input;
    const { id, first_name, last_name, email } = user;

    if (process.env.NODE_ENV === "development") return;

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          EXT_ID: id,
          PRENOM: first_name,
          NOM: last_name,
        },
      }),
    });

    const contact = await response.json();
    if (!response.ok) console.log(contact);

    await addContactToList({ id: contact.id });
  });

const addContactToList = async ({ id }: { id: string }) => {
  const LIST_ID = 6;

  const response = await fetch(
    `https://api.brevo.com/v3/contacts/lists/${LIST_ID}/contacts/add`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({ ids: [id] }),
    },
  );

  const result = await response.json();
  if (!response.ok) console.log(result);
};
