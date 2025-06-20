import { stripe } from "@/lib/stripe";
import { prisma } from "@conquest/db/prisma";
import { updateUser } from "@conquest/db/users/updateUser";
import { addDays } from "date-fns";
import { protectedProcedure } from "../trpc";

export const completeOnboarding = protectedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const { id, firstName, lastName, email, workspaceId } = user;

    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: {
        workspaceId,
      },
    });

    await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        stripeCustomerId: customer.id,
        trialEnd: addDays(new Date(), 7),
      },
    });

    await updateUser({
      id,
      onboarding: new Date(),
    });
  },
);
