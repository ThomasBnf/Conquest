import type { NodeRecurringSchedule } from "@/schemas/node.schema";

export const cronBuilder = (node: NodeRecurringSchedule) => {
  const { repeat_on, frequency, time } = node;

  const [hours, minutes] = time.split(":").map(Number);

  switch (frequency) {
    case "daily":
      return `${minutes} ${hours} * * *`;
    case "weekly": {
      const dayNumbers = repeat_on
        .map((day) => {
          const dayMap: Record<string, number> = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
          };
          return dayMap[day];
        })
        .join(",");
      return `${minutes} ${hours} * * ${dayNumbers}`;
    }
  }
};
