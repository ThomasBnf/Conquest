import { UserWithWorkspaceSchema } from "@conquest/zod/schemas/user.schema";
import * as Sentry from "@sentry/node";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
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

  const user = UserWithWorkspaceSchema.parse(ctx.session?.user);

  return next({ ctx: { user } });
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const protectedProcedure = t.procedure
  .use(sentryMiddleware)
  .use(middleware);
