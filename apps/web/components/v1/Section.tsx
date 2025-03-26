import { cn } from "@conquest/ui/cn";
import * as React from "react";

const Section = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("mx-auto w-full max-w-6xl py-16 max-xl:px-4", className)}
    {...props}
  />
));
Section.displayName = "Section";

const Heading = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "max-w-4xl text-balance font-semibold text-2xl text-gradient tracking-tight lg:text-3xl",
      className,
    )}
    {...props}
  />
));
Heading.displayName = "Heading";

const SubHeading = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-2 max-w-3xl text-balance text-base text-muted-foreground",
      className,
    )}
    {...props}
  />
));
SubHeading.displayName = "SubHeading";

const Container = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("mt-10 flex min-h-fit", className)} {...props}>
    {children}
  </div>
));
Container.displayName = "Container";

export { Container, Heading, Section, SubHeading };
