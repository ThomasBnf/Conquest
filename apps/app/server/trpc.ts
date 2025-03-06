import { getUserById } from "@conquest/db/users/getUserById";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const { createCallerFactory, router } = t;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

  const user = await getUserById({ id: ctx.session.user.id });

  return next({
    ctx: {
      user: UserSchema.parse(user),
    },
  });
});
