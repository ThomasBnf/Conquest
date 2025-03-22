import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  url: string;
};

export const SignupEmail = ({ url }: Props) => (
  <Html>
    <Tailwind>
      <Head />
      <Body className="bg-white font-sans">
        <Preview>Your login code for Conquest</Preview>
        <Container className="mx-auto my-10 max-w-[500px] rounded border border-neutral-200 border-solid px-10 py-5">
          <Heading className="pt-4 font-medium text-2xl leading-tight tracking-[-0.5px]">
            Your login code for Conquest
          </Heading>
          <Section className="py-4">
            <Button
              href={url}
              className="block w-fit rounded bg-[#5067D7] px-6 py-3 text-center font-semibold text-sm text-white no-underline"
            >
              Login to Conquest
            </Button>
          </Section>
          <Text className="mb-4 text-gray-700 text-sm leading-relaxed">
            This link and code will only be valid for the next 5 minutes.
          </Text>
          <Hr className="my-6 border-neutral-200" />
          <Link
            href="https://useconquest.com"
            className="text-gray-400 text-sm"
          >
            Conquest
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
