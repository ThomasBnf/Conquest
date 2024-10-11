import { cn } from "@conquest/ui/cn";

type Props = {
  className?: string;
};

export const Loader = ({ className }: Props) => {
  return <svg className={cn("animate-spin h-5 w-5 mr-3", className)} viewBox="0 0 24 24" />;
};
