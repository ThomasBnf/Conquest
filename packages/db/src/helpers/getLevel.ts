import { Level } from "@conquest/zod/schemas/level.schema";

type Props = {
  levels: Level[] | undefined;
  pulse: number;
};

export const getLevel = ({ levels, pulse }: Props): Level | null => {
  if (!levels?.length || pulse === 0) return null;

  const sortedLevels = levels.sort((a, b) => b.number - a.number);

  if (
    sortedLevels[0] &&
    sortedLevels[0].to !== null &&
    pulse > sortedLevels[0].to
  ) {
    return sortedLevels[0];
  }

  const level = sortedLevels.find(
    (level) => pulse >= level.from && (level.to === null || pulse <= level.to),
  );

  return level ?? null;
};
