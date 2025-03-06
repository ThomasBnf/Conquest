import { prisma } from "../prisma";

type Props =
  | {
      id: string;
    }
  | {
      external_id: string;
      workspace_id: string;
    };

export const deleteChannel = async (props: Props) => {
  if ("external_id" in props) {
    const { external_id, workspace_id } = props;

    await prisma.channel.delete({
      where: {
        external_id_workspace_id: {
          external_id,
          workspace_id,
        },
      },
    });
  }

  if ("id" in props) {
    await prisma.channel.delete({
      where: { id: props.id },
    });
  }
};
