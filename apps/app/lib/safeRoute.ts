import { createZodRoute } from "next-zod-route";

type SlackError = Error & {
  code?: string;
  data?: {
    ok: boolean;
    error: string;
    response_metadata: Record<string, unknown>;
  };
};

export class CustomError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const safeRoute = createZodRoute({
  handleServerError: (error: SlackError) => {
    if (error instanceof CustomError) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.status,
      });
    }

    if (error.code === "slack_webapi_platform_error") {
      return new Response(JSON.stringify(error.data), { status: 200 });
    }

    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 400,
    });
  },
});
