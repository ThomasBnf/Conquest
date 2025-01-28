import { Card } from "@/components/card";
import { Section } from "@/components/section";
import { Button } from "@conquest/ui/button";

export const FreeTrial = () => {
  return (
    <Section className="py-12 text-center">
      <Card className="items-center gap-10 border bg-background py-12">
        <h2 className="z-10 flex flex-col gap-1 text-3xl">
          <span className="font-semibold">Start with a 14-day</span>
          <span className="font-mono tracking-tighter">
            free trial of premium.
          </span>
        </h2>
        <div className="flex gap-2">
          <Button size="md">Get started</Button>
          <Button variant="outline" size="md">
            Get a demo
          </Button>
        </div>
      </Card>
    </Section>
  );
};
