import { Hono } from "hono";

export const livestorm = new Hono().post("/", async (c) => {
  const body = await c.req.json();

  console.log("Received Livestorm webhook:", body);

  return c.json({ success: true });
});
