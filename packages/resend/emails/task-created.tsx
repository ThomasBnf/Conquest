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
  taskId: string;
  taskTitle: string;
  taskDueDate: string;
};

const TaskCreated = ({ slug, taskId, taskTitle, taskDueDate }: Props) => {
  return (
    <Html>
      <Head />
      <Preview>New task "{taskTitle}" has been created</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
            <Logo />
            <Heading className="p-0 mx-0 text-xl font-medium text-black mt-7">
              New task "{taskTitle}" has been created
            </Heading>
            <Text className="leading-6 text-gray-700">
              A new task has been created for you.
            </Text>
            <Text className="leading-6 text-gray-700">
              The task is due on {taskDueDate}.
            </Text>
            <Section className="mt-8 mb-8">
              <Link
                className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-sm text-white no-underline"
                href={`${env.NEXT_PUBLIC_BASE_URL}/${slug}/tasks/${taskId}`}
              >
                View task
              </Link>
            </Section>
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TaskCreated;
