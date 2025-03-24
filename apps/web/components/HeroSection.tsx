import { AnimatedGroup } from "@conquest/ui/animated-group";
import { Button } from "@conquest/ui/button";
import { TextAnimate } from "@conquest/ui/text-animate";
import Image from "next/image";

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
  return (
    <section className="flex flex-col gap-4 text-balance bg-sidebar px-4 pt-24 pb-6 text-center">
      <TextAnimate
        as="h1"
        animation="blurInUp"
        className="font-bold font-tasa text-5xl"
      >
        Your community is powerful.
      </TextAnimate>
      <TextAnimate
        as="p"
        animation="blurInUp"
        delay={0.5}
        className="text-lg text-muted-foreground"
      >
        Track, measure and prove your community's impact. All in one place.
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
        <Button key="1" size="md">
          Sign up for free
        </Button>
        <Button key="2" variant="outline" size="md">
          Get a demo
        </Button>
      </AnimatedGroup>
      <TextAnimate
        as="p"
        animation="blurInUp"
        delay={0.9}
        className="text-muted-foreground"
      >
        Free 14 day trial • No CC required
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
        <div className="mt-6 rounded border bg-background p-1">
          <Image
            src="/hero-image.png"
            alt="app screen"
            width="2700"
            height="1440"
            className="rounded"
          />
        </div>
      </AnimatedGroup>
    </section>
  );
};
