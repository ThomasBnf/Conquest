import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";
import { z } from "zod";

export class CustomError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const safeAction = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
    });
  },
  handleServerError(error: Error, utils: { metadata: { name: string } }) {
    if (error instanceof CustomError) {
      return error.message;
    }

    const { metadata } = utils;

    console.log("--- LOG ERROR ---");
    console.log(metadata);
    console.error(error.message);
    console.log("--- LOG ERROR ---");

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});
