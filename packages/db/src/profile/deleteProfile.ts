import { prisma } from "../prisma";

type Props =
  | { id: string }
  | {
      username: string;
      workspaceId: string;
    }
  | {
      externalId: string;
      workspaceId: string;
    };

export const deleteProfile = async (props: Props) => {
  if ("id" in props) {
    await prisma.profile.delete({
      where: {
        id: props.id,
      },
    });
  } else if ("externalId" in props) {
    const { externalId, workspaceId } = props;
    await prisma.profile.deleteMany({
      where: {
        externalId,
        workspaceId,
      },
    });
  } else if ("username" in props) {
    const { username, workspaceId } = props;
    await prisma.profile.deleteMany({
      where: {
        workspaceId,
        attributes: {
          path: ["username"],
          equals: username,
        },
      },
    });
  }
};
