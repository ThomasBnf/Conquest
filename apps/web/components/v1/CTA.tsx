import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Heading, Section, SubHeading } from "./Section";

export const CTA = () => {
  return (
    <div className="bg-[#171717] py-12 text-white">
      <Section id="cta" className="flex flex-col items-start gap-2">
        <Heading className="text-balance text-4xl md:max-w-md lg:max-w-3xl lg:text-6xl">
          From community blind spot to 20/20 vision
        </Heading>
        <SubHeading className="text-lg text-white">
          Start your 14-day free trial and see how Conquest can transform your
          community.
        </SubHeading>
        <Link
          href="https://app.conquest.com/auth/signup"
          className={cn(
            buttonVariants({ variant: "brand", size: "md" }),
            "mt-6",
          )}
        >
          Start 14-day free trial
          <ArrowRight size={16} />
        </Link>
      </Section>
    </div>
  );
};
