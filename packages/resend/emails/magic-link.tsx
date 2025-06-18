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
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 pb-5">
          <Logo />
          <Heading className="mx-0 mt-7 p-0 font-medium text-2xl text-black">
            Your login code for Conquest
          </Heading>
          <Text className="text-gray-700 leading-6">
            This link and code will only be valid for the next 5 minutes.
          </Text>
          <Section className="py-4">
            <Button
              href={url}
              className="block w-fit rounded bg-[#5067D7] px-5 py-2.5 text-center font-medium text-white no-underline"
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
