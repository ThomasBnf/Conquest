import { icons } from "lucide-react";

type Props = {
  name: keyof typeof icons;
  size?: number;
  className?: string;
};

export const Icon = ({ name, size, className }: Props) => {
  const LucideIcon = icons[name];

  return <LucideIcon size={size} className={className} />;
};
