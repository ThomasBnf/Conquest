import { LEVELS } from "@/constant";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters";
import { PrismaClientKnownRequestError } from "@conquest/db/enum";
import type { Prisma } from "@conquest/db/types";
import { createWorkspace } from "@conquest/db/workspaces/createWorkspace";
import { resend } from "@conquest/resend";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { isBefore, subHours } from "date-fns";
import { randomUUID } from "node:crypto";

export const createAuthPrismaAdapter = (
  prisma: Prisma.PrismaClient,
): Adapter => ({
  createUser: async ({ email, image }) => {
    if (!email) {
      throw Error("Provider did not forward email but it is required");
    }

    const workspace = await createWorkspace({
      name: "",
      slug: randomUUID(),
    });

    const user = UserSchema.parse(
      await prisma.user.create({
        data: {
          email,
          avatarUrl: image ?? null,
          emailVerified: new Date(),
          workspaceId: workspace.id,
        },
      }),
    );

    await prisma.userInWorkspace.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    });

    await prisma.level.createMany({
      data: LEVELS.map((level) => ({
        ...level,
        workspaceId: workspace.id,
      })),
    });

    if (process.env.NODE_ENV === "development") return user as AdapterUser;

    await resend.emails.send({
      from: "Conquest <hello@useconquest.com>",
      to: ["audrey@useconquest.com", "thomas.bnfls@gmail.com"],
      subject: "🚨 New user onboarding",
      html: `<p>New user onboarding: ${user.email}</p>`,
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
        user: true,
      },
    });

    if (!userAndSession) return null;

    const { user, ...session } = userAndSession;
    const { id, lastActivityAt } = user;

    const oneHourAgo = subHours(new Date(), 1);

    if (lastActivityAt && isBefore(lastActivityAt, oneHourAgo)) {
      await prisma.user.update({
        where: { id },
        data: { lastActivityAt: new Date() },
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
