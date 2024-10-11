import {
    DEFAULT_SERVER_ERROR_MESSAGE,
    createSafeActionClient,
} from "next-safe-action";
import { z } from "zod";
  
  export const safeAction = createSafeActionClient({
    defineMetadataSchema() {
      return z.object({
        name: z.string(),
      });
    },
    handleServerError(e: Error, utils: { metadata: { name?: string } }) {
      const { metadata } = utils;
  
      console.log("--- LOG ERROR ---");
      console.log(metadata);
      console.error(e.message);
      console.log("--- LOG ERROR ---");
  
      return DEFAULT_SERVER_ERROR_MESSAGE;
    },
  });
  