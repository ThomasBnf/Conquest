import { schemaTask } from "@trigger.dev/sdk/v3";

export const sendSlackMessage = schemaTask({
  id: "send-slack-message",
  machine: "small-2x",
  run: async () => {},
});
