import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type Props =
  | {
      id: string;
    }
  | {
      primaryEmail: string;
      workspaceId: string;
    };

export const getMember = async (props: Props) => {
  let where: Prisma.MemberWhereInput;

  if ("primaryEmail" in props) {
    where = {
      primaryEmail: props.primaryEmail,
      workspaceId: props.workspaceId,
    };
  } else {
    where = {
      id: props.id,
    };
  }

  const member = await prisma.member.findFirst({
    where,
  });

  if (!member) return null;
  return MemberSchema.parse(member);
};
