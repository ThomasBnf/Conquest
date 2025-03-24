import { Logo } from "@conquest/ui/brand/logo";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { OrbitingCircles } from "@conquest/ui/orbiting-circles";

export const Integrations = () => {
  return (
    <section className="flex flex-col items-start gap-4 text-balance px-4 py-24">
      <h2 className="font-medium text-3xl">
        Your tools. <br /> Your data. <br /> Instantly connected.
      </h2>
      <p className="text-base text-muted-foreground">
        Built to connect. Designed to save you time. Retrieve historical &
        real-time data with zero effort.
      </p>
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <Logo size={48} />
        <OrbitingCircles>
          <Slack size={48} />
          <Discord size={48} />
          <Discourse size={48} />
          <Twitter size={48} />
        </OrbitingCircles>
        <OrbitingCircles radius={100} reverse speed={1.5}>
          <Linkedin size={48} />
          <Livestorm size={48} />
          <Github size={48} />
        </OrbitingCircles>
      </div>
    </section>
  );
};
