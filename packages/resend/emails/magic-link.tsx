import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";

type Props = {
  url: string;
};

const MagicLink = ({ url }: Props) => (
  <Html>
    <Head />
    <Preview>Your login code for Conquest</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto font-sans bg-white">
        <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
          <Logo />
          <Heading className="p-0 mx-0 text-2xl font-medium text-black mt-7">
            Your login code for Conquest
          </Heading>
          <Text className="leading-6 text-gray-700">
            This link and code will only be valid for the next 5 minutes.
          </Text>
          <Section className="py-4">
            <Button
              href={url}
              className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-sm text-white no-underline"
            >
              Login to Conquest
            </Button>
          </Section>

          <Footer />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default MagicLink;
