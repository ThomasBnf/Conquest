export const TAILWIND_COLORS = [
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "indigo",
] as const;

type TailwindColor = (typeof TAILWIND_COLORS)[number];

export const getRandomColor = (): TailwindColor => {
  const randomIndex = Math.floor(Math.random() * TAILWIND_COLORS.length);
  return TAILWIND_COLORS[randomIndex] as TailwindColor;
};

export const classes = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-orange-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-indigo-100",
  "bg-pink-100",
  "text-blue-900",
  "text-green-900",
  "text-yellow-900",
  "text-orange-900",
  "text-red-900",
  "text-purple-900",
  "text-indigo-900",
  "text-pink-900",
];
