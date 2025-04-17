"use client";

import { AnimatedGroup } from "@conquest/ui/animated-group";
import { buttonVariants } from "@conquest/ui/button";
import { TextAnimate } from "@conquest/ui/text-animate";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center gap-4 text-balance bg-sidebar px-4 pt-32 pb-12 text-center">
      <TextAnimate
        as="h1"
        animation="blurInUp"
        className="max-w-3xl font-bold font-telegraf text-4xl lg:text-6xl"
      >
        Your community is powerful. Now prove it.
      </TextAnimate>
      <TextAnimate
        as="p"
        animation="blurInUp"
        delay={0.5}
        className="font-suisse text-lg text-muted-foreground"
      >
        Track, measure and prove your community impact. All in one place.
      </TextAnimate>
      <AnimatedGroup
        variants={{
          container: {
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.75,
              },
            },
          },
          ...transitionVariants,
        }}
        className="mt-4 flex justify-center gap-2 "
      >
        <Link
          href="https://app.useconquest.com/auth/signup"
          className={buttonVariants({ variant: "brand", size: "md" })}
        >
          Try for free
          <ArrowRight size={16} />
        </Link>
        <Link
          href="https://cal.com/audrey-godard-conquest/30min"
          className={buttonVariants({ variant: "outline", size: "md" })}
        >
          Book a demo
        </Link>
      </AnimatedGroup>
      <TextAnimate
        as="p"
        animation="blurInUp"
        delay={0.9}
        className="text-muted-foreground"
      >
        14-day free trial • No CC required
      </TextAnimate>
      <AnimatedGroup
        variants={{
          container: {
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 1,
              },
            },
          },
          ...transitionVariants,
        }}
      >
        <Image
          src="/hero-image.png"
          alt="app screen"
          width={2700}
          height={1440}
          className="mt-6 rounded-md border p-1 lg:max-w-5xl"
        />
      </AnimatedGroup>
    </section>
  );
};
