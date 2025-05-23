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
  source: string;
  url: string;
};

const SuccessIntegration = ({ source, url }: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Your {source} integration is ready</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
            <Logo />
            <Heading className="mx-0 mt-7 p-0 font-medium text-2xl text-black">
              Your {source} integration is ready
            </Heading>
            <Text className="text-gray-700 leading-6">
              Your {source} is now connected to Conquest.
              <br />
              Ready to explore your community insights?
            </Text>
            <Section className="mt-8 mb-8">
              <Link
                className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-sm text-white no-underline"
                href={url}
              >
                Access to Conquest
              </Link>
            </Section>
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SuccessIntegration;
