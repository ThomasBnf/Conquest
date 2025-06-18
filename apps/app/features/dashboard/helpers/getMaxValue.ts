import { Source } from "@conquest/zod/enum/source.enum";

type WeeklyProfileData = {
  week: string;
  [key: string]: string | number;
};

export const getMaxValue = (
  data: WeeklyProfileData[] | undefined,
  sources: Source[],
): number => {
  if (!data) return 0;

  return data.reduce((max, entry) => {
    const weekMax = sources.reduce((weekMax, source) => {
      const value = Number(entry[source] || 0);
      return Math.max(weekMax, value);
    }, 0);
    return Math.max(max, weekMax);
  }, 0);
};
