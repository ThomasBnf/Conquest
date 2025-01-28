import { cn } from "@conquest/ui/cn";

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn("flex flex-col gap-4 text-balance px-4 py-20", className)}
    >
      {children}
    </section>
  );
};
