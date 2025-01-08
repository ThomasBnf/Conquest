import { cn } from "@conquest/ui/cn";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon,
  title,
  description,
  children,
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "absolute top-36 mx-auto flex w-full flex-col items-center justify-center",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-center">{icon}</div>
      <p className="text-center font-medium text-lg">{title}</p>
      <p className="mb-6 text-center text-muted-foreground">{description}</p>
      {children}
    </div>
  );
};
