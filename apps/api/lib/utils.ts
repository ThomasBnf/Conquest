import type { Context } from "hono";

export const badRequest = (c: Context, message: string) => {
  return c.json(
    { code: "BAD_REQUEST", error: message ?? "Bad request" },
    { status: 400 },
  );
};

export const unauthorized = (c: Context, message: string) => {
  return c.json(
    { code: "UNAUTHORIZED", error: message ?? "Unauthorized" },
    { status: 401 },
  );
};

export const notFound = (c: Context, message: string) => {
  return c.json(
    { code: "NOT_FOUND", error: message ?? "Not found" },
    { status: 404 },
  );
};
