import { Section } from "@/components/section";
import { Button } from "@conquest/ui/button";

export const Hero = () => {
  return (
    <Section className="pt-32">
      <h1 className="font-bold text-4xl">
        Your only platform for community growth
      </h1>
      <p className="text-base text-muted-foreground">
        Conquest is the CRM you need to track, understand, engage and scale your
        community.
      </p>
      <div className="mt-4">
        <div className="flex gap-2">
          <Button size="md">Get started</Button>
          <Button variant="outline" size="md">
            Get a demo
          </Button>
        </div>
        <p className="mt-2 text-muted-foreground">
          14 days free trial. No credit card required.
        </p>
      </div>
    </Section>
  );
};
