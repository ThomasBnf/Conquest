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
  error: unknown;
};

const ImportFailure = ({ slug, error }: Props) => (
  <Html>
    <Head />
    <Preview>Members import failed</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
          <Logo />
          <Heading className="mx-0 mt-7 p-0 font-medium text-black text-xl">
            Members import failed
          </Heading>
          <Text className="text-gray-700 leading-6">
            {JSON.stringify(error)}
          </Text>
          <Section className="mt-8 mb-8">
            <Link
              className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-sm text-white no-underline"
              href={`${env.NEXT_PUBLIC_URL}/${slug}`}
            >
              Go to Conquest
            </Link>
          </Section>
          <Footer />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default ImportFailure;
