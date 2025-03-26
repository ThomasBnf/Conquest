import { icons } from "lucide-react";

export const Icon = ({
  name,
  size,
  className,
}: {
  name: keyof typeof icons;
  size: number;
  className?: string;
}) => {
  const LucideIcon = icons[name];

  return <LucideIcon size={size} className={className} />;
};
