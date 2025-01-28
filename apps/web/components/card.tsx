import { cn } from "@conquest/ui/cn";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-1 text-balance p-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
