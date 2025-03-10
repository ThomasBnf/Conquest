import type { Source } from "@conquest/zod/enum/source.enum";
import { prisma } from "../prisma";

type Props = {
  source: Source;
};

export const deleteManyEvents = async ({ source }: Props) => {
  await prisma.event.deleteMany({
    where: { source },
  });
};
