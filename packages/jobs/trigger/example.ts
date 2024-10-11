import { logger, task, wait } from "@trigger.dev/sdk/v3";

export const runWorkflowTask = task({
  id: "runWorklow",
  run: async (payload: unknown, { ctx }) => {
    logger.log("Running workflow...", { payload, ctx });

    await wait.for({ seconds: 5 });

    return {
      message: "Workflow completed!",
    };
  },
});
