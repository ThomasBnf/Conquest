import { faker } from "@faker-js/faker";

export const getNumActivities = (): number => {
  const roll = Math.random();

  if (roll < 0.25) return 0;
  if (roll < 0.6) return faker.number.int({ min: 3, max: 6 });
  if (roll < 0.85) return faker.number.int({ min: 9, max: 15 });
  if (roll < 0.95) return faker.number.int({ min: 18, max: 30 });
  if (roll < 0.99) return faker.number.int({ min: 33, max: 90 });

  return faker.number.int({ min: 93, max: 300 });
};
