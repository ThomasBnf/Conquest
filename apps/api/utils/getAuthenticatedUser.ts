import { prisma } from "@conquest/db/prisma";

export const getAuthenticatedUser = async (request: Request) => {
  const headers = request.headers;

  const authorization = headers.get("Authorization");
  const hasBearer = authorization?.startsWith("Bearer");
  const token = authorization?.split("Bearer ")[1];

  if (!authorization) {
    return {
      error: {
        code: "UNAUTHORIZED",
        message: "Missing authorization header",
        status: 401,
      },
    };
  }

  if (!hasBearer) {
    return {
      error: {
        code: "UNAUTHORIZED",
        message: "Bearer token is required",
        status: 401,
      },
    };
  }

  if (!token) {
    return {
      error: {
        code: "UNAUTHORIZED",
        message: "Missing access token",
        status: 401,
      },
    };
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: {
      token,
    },
    include: {
      workspace: true,
    },
  });

  if (!apiKey) {
    return {
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid API key",
        status: 401,
      },
    };
  }

  return { workspaceId: apiKey.workspace.id };
};
