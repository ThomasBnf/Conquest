import { Badge } from "@conquest/ui/badge";
import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { Container, Heading, Section, SubHeading } from "./Section";

export const UseCases = () => {
  return (
    <Section id="use-cases">
      <Badge variant="outline" className="mb-4 h-7 shadow-sm">
        <Image src="use-cases.svg" alt="use-cases" width={16} height={16} />
        <p>USE CASES</p>
      </Badge>
      <Heading>Grow smarter with community data-driven decisions</Heading>
      <SubHeading>Beneficial for every member of your team</SubHeading>
      <Container className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid rounded-md border bg-sidebar p-6 shadow-sm lg:p-8">
          <Image src="sales.svg" alt="icon" width={36} height={36} />
          <h3 className="mt-10 mb-2 font-semibold text-gradient text-xl">
            Sales/Growth teams
          </h3>
          <Check text="Refine your ICP to boost conversion rates" />
          <Check text="Launch targeted and personalized campaigns" />
        </div>
        <div className="grid rounded-md border bg-sidebar p-6 shadow-sm lg:p-8">
          <Image src="product.svg" alt="icon" width={36} height={36} />
          <h3 className="mt-10 mb-2 font-semibold text-gradient text-xl">
            Product/Tech teams
          </h3>
          <Check text="Gather product and features feedback " />
          <Check text="Conduct in-depth user interviews with your ambassadors" />
        </div>
        <div className="grid rounded-md border bg-sidebar p-6 shadow-sm lg:p-8">
          <Image src="marketing.svg" alt="icon" width={36} height={36} />
          <h3 className="mt-10 mb-2 font-semibold text-gradient text-xl">
            Marketing teams
          </h3>
          <Check text="Create highly targeted campaigns" />
          <Check text="Leverage user-generated content opportunities" />
        </div>
        <div className="grid rounded-md border bg-sidebar p-6 shadow-sm lg:p-8">
          <Image src="hr.svg" alt="icon" width={36} height={36} />
          <h3 className="mt-10 mb-2 font-semibold text-gradient text-xl">
            HR teams
          </h3>
          <Check text="Spot and attract top talent from your community" />
          <Check text="Enhance employer branding and culture" />
        </div>
      </Container>
    </Section>
  );
};

const Check = ({ text }: { text: string }) => {
  return (
    <div className="mt-2 flex items-center gap-2 text-balance">
      <CheckIcon
        size={24}
        className="mt-0.5 shrink-0 rounded-md border border-main-200 bg-main-100/50 p-1 text-main-500"
      />
      <p className="text-base text-muted-foreground">{text}</p>
    </div>
  );
};
