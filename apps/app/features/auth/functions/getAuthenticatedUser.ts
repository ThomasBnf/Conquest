import { prisma } from "lib/prisma";
import { CustomError } from "lib/safeRoute";

export const getAuthenticatedUser = async (request: Request) => {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  const apiKey = await prisma.apikeys.findUnique({
    where: {
      token,
    },
    select: {
      workspace_id: true,
    },
  });

  if (!apiKey) throw new CustomError("Unauthorized: Invalid API key", 401);

  const user = await prisma.users.findUnique({
    where: {
      id: apiKey?.workspace_id,
    },
  });

  if (!user) throw new CustomError("Unauthorized: User not found", 401);

  return user;
};
