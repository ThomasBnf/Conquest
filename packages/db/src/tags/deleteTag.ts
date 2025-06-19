import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteTag = async ({ id }: Props) => {
  await prisma.tag.delete({
    where: { id },
  });

  // await client.query({
  //   query: `
  //     ALTER TABLE member
  //     UPDATE tags = arrayFilter(x -> x != '${id}', tags)
  //     WHERE hasAny(tags, ['${id}'])
  //   `,
  // });
};
