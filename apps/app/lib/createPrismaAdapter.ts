import { LEVELS } from "@/constant";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters";
import { client } from "@conquest/clickhouse/client";
import { PrismaClientKnownRequestError } from "@conquest/db/enum";
import type { Prisma } from "@conquest/db/types";
import { createWorkspace } from "@conquest/db/workspaces/createWorkspace";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { isBefore, subHours } from "date-fns";
import { v4 as uuid } from "uuid";

export const createAuthPrismaAdapter = (
  prisma: Prisma.PrismaClient,
): Adapter => ({
  createUser: async ({ email, image }) => {
    if (!email) {
      throw Error("Provider did not forward email but it is required");
    }

    const workspace = await createWorkspace({
      name: "",
      slug: uuid(),
    });

    const user = await prisma.user.create({
      data: {
        email,
        avatar_url: image ?? null,
        emailVerified: new Date(),
        workspace_id: workspace.id,
      },
    });

    await prisma.memberInWorkspace.create({
      data: {
        user_id: user.id,
        workspace_id: workspace.id,
      },
    });

    await client.insert({
      table: "level",
      values: LEVELS.map((level) => ({
        ...level,
        workspace_id: workspace.id,
      })),
      format: "JSON",
    });

    return user as AdapterUser;
  },
  getUser: async (id) => {
    return UserSchema.parse(await prisma.user.findUnique({ where: { id } }));
  },
  getUserByEmail: async (email) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return UserSchema.parse(user);
  },
  async getUserByAccount(provider_providerAccountId) {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId },
      include: { user: true },
    });

    return (account?.user as AdapterUser) ?? null;
  },

  updateUser: ({ id, ...data }) => {
    return prisma.user.update({
      where: { id },
      ...stripUndefined(data),
    }) as Promise<AdapterUser>;
  },
  deleteUser: (id) => {
    return prisma.user.delete({ where: { id } }) as Promise<AdapterUser>;
  },
  linkAccount: (data) => {
    return prisma.account.create({ data }) as unknown as AdapterAccount;
  },
  unlinkAccount: (provider_providerAccountId) => {
    return prisma.account.delete({
      where: { provider_providerAccountId },
    }) as unknown as AdapterAccount;
  },
  async getSessionAndUser(sessionToken) {
    const userAndSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!userAndSession) return null;

    const { user, ...session } = userAndSession;
    const { id, last_activity_at } = user;

    const oneHourAgo = subHours(new Date(), 1);

    if (last_activity_at && isBefore(last_activity_at, oneHourAgo)) {
      await prisma.user.update({
        where: { id },
        data: { last_activity_at: new Date() },
      });
    }

    return {
      session,
      user,
    } as {
      session: AdapterSession;
      user: AdapterUser;
    };
  },
  createSession: (data) => {
    return prisma.session.create(stripUndefined(data));
  },
  updateSession: (data) => {
    return prisma.session.update({
      where: { sessionToken: data.sessionToken },
      ...stripUndefined(data),
    });
  },
  deleteSession: (sessionToken) => {
    return prisma.session.delete({ where: { sessionToken } });
  },
  async createVerificationToken(data) {
    const verificationToken = await prisma.verificationToken.create(
      stripUndefined(data),
    );
    if ("id" in verificationToken && verificationToken.id) {
      const { id, ...rest } = verificationToken;
      return rest;
    }
    return verificationToken;
  },

  async useVerificationToken(identifier_token) {
    try {
      const verificationToken = await prisma.verificationToken.delete({
        where: { identifier_token },
      });
      if ("id" in verificationToken && verificationToken.id) {
        const { id, ...rest } = verificationToken;
        return rest;
      }
      return verificationToken;
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      )
        return null;
      throw error;
    }
  },
  async getAccount(providerAccountId, provider) {
    return prisma.account.findFirst({
      where: { providerAccountId, provider },
    }) as Promise<AdapterAccount | null>;
  },
});

function stripUndefined<T>(obj: T) {
  const data = {} as T;
  for (const key in obj) if (obj[key] !== undefined) data[key] = obj[key];
  return { data };
}
