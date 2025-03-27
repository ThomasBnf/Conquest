import { Badge } from "@conquest/ui/badge";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import Image from "next/image";
import { Container, Heading, Section, SubHeading } from "./Section";

export const integrations = [
  {
    logo: <Discord size={16} />,
    source: "Discord" as const,
  },
  {
    logo: <Discourse size={16} />,
    source: "Discourse" as const,
  },
  {
    logo: <Slack size={16} />,
    source: "Slack" as const,
  },
  {
    logo: <Github size={16} />,
    source: "Github" as const,
  },
  {
    logo: <Livestorm size={16} />,
    source: "Livestorm" as const,
  },
];

export const HowItWorks = () => {
  return (
    <Section id="how-it-works">
      <Badge variant="secondary" className="mb-4 h-7 shadow-sm">
        <Image src="/settings.svg" alt="how-it-works" width={16} height={16} />
        <p className="text-sm">HOW IT WORKS</p>
      </Badge>
      <Heading>Integrates everywhere your community lives</Heading>
      <SubHeading>No-code integrations that make your life easier </SubHeading>
      <Container className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="col-span-1 rounded-md border bg-sidebar pb-4 md:col-span-2">
          <div className="p-8">
            <Image src="/connect.svg" alt="connect" width={32} height={32} />
            <div className="space-y-1">
              <h3 className="mt-8 font-semibold text-gradient text-xl">
                Connect your tools
              </h3>
              <p className="text-balance text-base text-muted-foreground">
                Seamlessly connect Conquest with all your tools and your SaaS to
                better identify all behaviors.
              </p>
            </div>
          </div>
          <Image
            src="/integrations.png"
            alt="integrations"
            width={2700}
            height={1440}
          />
        </div>
        <div className="col-span-1 flex flex-col justify-between rounded-md border bg-sidebar p-8 lg:col-span-3">
          <div className="col-span-2">
            <Image src="/database.svg" alt="Collect" width={32} height={32} />
            <h3 className="mt-6 font-semibold text-gradient text-xl">
              Collect data
            </h3>
            <p className="text-balance text-base text-muted-foreground">
              Retrieve historical and future data from your tools and associate
              it with your members to never miss any interactions.
            </p>
          </div>
          <div className="flex h-full items-center py-8">
            <Image
              src="/data-collection.png"
              alt="Data collection"
              width={2700}
              height={1440}
            />
          </div>
        </div>
        <div className="col-span-1 rounded-md border bg-sidebar lg:col-span-5">
          <div className="grid gap-12 p-6 lg:grid-cols-5 lg:p-8">
            <div className="col-span-2">
              <Image src="/analyze.svg" alt="Analyze" width={32} height={32} />
              <h3 className="mt-6 font-semibold text-gradient text-xl">
                Analyze member activity
              </h3>
              <p className="text-balance text-muted-foreground">
                Conquest consolidates all your member activities and generates
                actionable insights to boost community growth.
              </p>
            </div>
            <div className="col-span-3 rounded-md border bg-background">
              <Image
                src="/member-page.png"
                alt="Member page"
                width={2700}
                height={1440}
                className="rounded-md p-1"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
