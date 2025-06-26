import { Source } from "@conquest/zod/enum/source.enum";
import { Profile } from "@conquest/zod/schemas/profile.schema";

export const getMaxValue = (profiles: Profile[], sources: Source[]): number => {
  if (!profiles) return 0;

  return profiles.reduce((max, profile) => {
    const weekMax = sources.reduce((weekMax) => {
      const value = Number(profile.attributes?.source || 0);
      return Math.max(weekMax, value);
    }, 0);
    return Math.max(max, weekMax);
  }, 0);
};
