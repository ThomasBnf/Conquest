export const getPresenceLabel = (presence: number) => {
  const presenceLabels = {
    12: "Active 30+ days in 3 quarters",
    11: "Active 30+ days in 2 quarters",
    10: "Active 30+ days in 1 quarter",
    9: "Active 7+ days in 3 months",
    8: "Active 7+ days in 2 months",
    7: "Active 7+ days in 1 month",
    6: "Active 2+ days in 3 weeks",
    5: "Active 2+ days in 2 weeks",
    4: "Active 2+ days in 1 week",
    3: "No presence",
    2: "No presence",
    1: "No presence",
    0: "No presence",
  } as const;

  return (
    presenceLabels[presence as keyof typeof presenceLabels] ?? presenceLabels[0]
  );
};
