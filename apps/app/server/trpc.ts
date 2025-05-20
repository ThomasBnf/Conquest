import { UserSchema } from "@conquest/zod/schemas/user.schema";
import * as Sentry from "@sentry/node";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.log(error);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? fromError(error.cause).message
            : null,
      },
    };
  },
});

export const { createCallerFactory, router } = t;
export const publicProcedure = t.procedure;

const middleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

  const user = UserSchema.parse(ctx.session?.user);

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  Sentry.setContext("workspace", {
    id: user.workspaceId,
  });

  return next({
    ctx: {
      user,
    },
  });
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const protectedProcedure = t.procedure
  .use(sentryMiddleware)
  .use(middleware);
