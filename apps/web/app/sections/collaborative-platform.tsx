import { Card } from "@/components/card";
import { Section } from "@/components/section";
import { Button } from "@conquest/ui/button";
import Image from "next/image";

export const CollaborativePlatform = () => {
  return (
    <Section>
      <span className="font-mono text-main-400 text-xs uppercase">
        [Collaborative Platform]
      </span>
      <h2 className="font-semibold text-3xl">
        Make your community a top priority across your company
      </h2>
      <p className="text-base text-muted-foreground">
        Collaborate more closely with your teams, where the magic of growth
        happens.
      </p>
      <div className="mt-4 grid grid-cols-1 divide-y border">
        <Card>
          <Image
            src="/slack.avif"
            alt="Slack"
            width={1000}
            height={1000}
            sizes="100%"
          />
          <h3 className="font-medium text-lg">Data aggregator</h3>
          <p className="text-base text-muted-foreground">
            Collect members information in one place and become a data-driven
            community expert.
          </p>
          <Button variant="link" className="mt-4 px-0">
            Learn more
          </Button>
        </Card>
        <Card>
          <Image
            src="/slack.avif"
            alt="Slack"
            width={1000}
            height={1000}
            sizes="100%"
          />
          <h3 className="font-medium text-lg">Activity tracking</h3>
          <p className="text-base text-muted-foreground">
            Automatically track member interactions with your product and
            content across all channels to get the full picture.
          </p>
          <Button variant="link" className="mt-4 px-0">
            Learn more
          </Button>
        </Card>
        <Card>
          <Image
            src="/slack.avif"
            alt="Slack"
            width={1000}
            height={1000}
            sizes="100%"
          />
          <h3 className="font-medium text-lg">Member scoring</h3>
          <p className="text-base text-muted-foreground">
            Categorize your members into precise engagement level and know
            exactly where to prioritize your efforts.
          </p>
          <Button variant="link" className="mt-4 px-0">
            Learn more
          </Button>
        </Card>
      </div>
    </Section>
  );
};
