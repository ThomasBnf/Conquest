import { createZodRoute } from "next-zod-route";

export class CustomError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const safeRoute = createZodRoute({
  handleServerError: (error: Error) => {
    if (error instanceof CustomError) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.status,
      });
    }

    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 400,
    });
  },
});
