import { env } from "@conquest/env";
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
  Text,
} from "@react-email/components";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";

type Props = {
  slug: string;
  workflowId: string;
  workflowName: string;
  runId: string;
};

const WorkflowFailed = ({ slug, workflowId, workflowName, runId }: Props) => (
  <Html>
    <Head />
    <Preview>Workflow "{workflowName}" has failed to run</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
          <Logo />
          <Heading className="mx-0 mt-7 p-0 font-medium text-black text-xl">
            Workflow "{workflowName}" has failed to run
          </Heading>
          <Text className="text-gray-700 leading-6">
            Your workflow <strong>"{workflowName}"</strong> encountered an error
            during execution.
          </Text>
          <Text className="text-gray-700 leading-6">
            Please review the workflow configuration and make necessary
            adjustments to resolve this issue.
          </Text>
          <Section className="mt-8 mb-8">
            <Link
              className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-sm text-white no-underline"
              href={`${env.NEXT_PUBLIC_URL}/${slug}/workflows/${workflowId}/runs/${runId}`}
            >
              View failed run
            </Link>
          </Section>
          <Footer />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WorkflowFailed;
