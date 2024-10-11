import { App, type MessageEvent } from "@slack/bolt";
import dotenv from "dotenv";
import express from "express";

const appExpress = express();
const port = process.env.PORT || 3000;

dotenv.config();

const token = process.env.SLACK_BOT_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const appToken = process.env.SLACK_APP_TOKEN;

const app = new App({
  token,
  signingSecret,
  socketMode: true,
  appToken,
});

app.event("message", async ({ message: messageEvent }) => {
  const message = messageEvent as MessageEvent;
  console.log(message);

  if (message.subtype === undefined) {
  }

  if (message.type === "message") {
    console.log("new message", message);
  }
  if (message.subtype === "message_changed") {
    console.log("message changed", message);
  }
  if (message.subtype === "message_deleted") {
    console.log("message deleted", message);
  }
  if (message.subtype === "message_replied") {
    console.log("message replied", message);
  }
});

(async () => {
  await app.start();
  appExpress.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  console.log("⚡️ Bolt app is running!");
})();
