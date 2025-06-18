import { env } from "@conquest/env";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";

type Props = {
  slug: string;
  member: MemberWithLevel;
  workflow: Workflow;
  runId: string;
};

const WorkflowSuccess = ({ slug, member, workflow, runId }: Props) => (
  <Html>
    <Head />
    <Preview>Workflow "{workflow.name}" has run successfully</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
          <Logo />
          <Heading className="mx-0 mt-7 p-0 font-medium text-black text-xl">
            Workflow "{workflow.name}" has run successfully for{" "}
            {member.firstName} {member.lastName}
          </Heading>
          <Section className="mt-8 mb-8">
            <Link
              className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-sm text-white no-underline"
              href={`${env.NEXT_PUBLIC_URL}/${slug}/workflows/${workflow.id}/runs/${runId}`}
            >
              View run
            </Link>
          </Section>
          <Footer />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WorkflowSuccess;
