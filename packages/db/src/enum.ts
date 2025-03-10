import { Prisma } from "@prisma/client";

const JsonNull = Prisma.JsonNull;
const DbNull = Prisma.DbNull;

const PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export { DbNull, JsonNull, PrismaClientKnownRequestError };
