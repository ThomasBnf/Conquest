import { Badge } from "@conquest/ui/badge";
import Image from "next/image";
import { Container, Heading, Section, SubHeading } from "./Section";

export const Benefits = () => {
  return (
    <Section id="benefits">
      <Badge variant="secondary" className="mb-4 h-7 shadow-sm">
        <Image src="/circle-plus.svg" alt="benfits" width={16} height={16} />
        <p className="text-sm">BENEFITS</p>
      </Badge>
      <Heading>Understand your community in seconds</Heading>
      <SubHeading>Gather every single event and gain visibility</SubHeading>
      <Container className="flex-col gap-2">
        <div className="relative grid min-h-[450px] grid-cols-12 justify-between gap-4 overflow-hidden rounded-md border bg-sidebar shadow-sm max-lg:p-6 md:gap-10 lg:p-8">
          <div className="col-span-12 md:col-span-5">
            <Badge variant="secondary" className="mb-4 h-7 shadow-sm">
              ACTIVITIES
            </Badge>
            <h3 className="text-balance font-semibold text-2xl tracking-tight">
              Track and collect your members activities across all channels in
              one place
            </h3>
          </div>
          <Image
            src="/activities.webp"
            alt="Activities"
            width={650}
            height={400}
            className="-right-1 top-10 col-span-12 rounded-md border p-1 md:col-span-7 lg:absolute"
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="flex flex-col gap-10 rounded-md border bg-sidebar shadow-sm max-lg:p-6 lg:p-8">
            <div>
              <Badge variant="secondary" className="mb-4 h-7 shadow-sm">
                PROFILE
              </Badge>
              <h3 className="text-balance font-semibold text-2xl tracking-tight">
                Access your members valuable information and past activities
              </h3>
            </div>
            <Image
              src="/profile.png"
              alt="Member profile details"
              width={2700}
              height={1440}
              className="col-span-7 rounded-md border p-1"
            />
          </div>
          <div className="flex flex-col gap-10 rounded-md border bg-sidebar shadow-sm max-lg:p-6 lg:p-8">
            <div>
              <Badge variant="secondary" className="mb-4 h-7 shadow-sm">
                ACTIONS
              </Badge>
              <h3 className="text-balance font-semibold text-2xl tracking-tight">
                Anticipate engagement and know who to focus on
              </h3>
            </div>
            <Image
              src="/actions-on-members.png"
              alt="Actions on members"
              width={2700}
              height={1440}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
};
