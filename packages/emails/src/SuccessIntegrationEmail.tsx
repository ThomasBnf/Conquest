import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  source: string;
  url: string;
};

export const SuccessIntegrationEmail = ({ source, url }: Props) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto max-w-lg py-5">
          <Heading className="pt-4 font-medium text-2xl text-neutral-800 leading-snug tracking-tight">
            Your {source} integration is ready
          </Heading>
          <Text className="text-base text-neutral-600 leading-relaxed">
            Your {source} is now connected to Conquest. Ready to explore your
            community insights?
          </Text>
          <Section className="pt-4">
            <Button
              className="block w-fit rounded bg-[#5067D7] px-6 py-3 text-center font-semibold text-sm text-white no-underline"
              href={url}
            >
              Access to Conquest
            </Button>
          </Section>
          <Hr className="my-6 bg-border" />
          <Link
            href="https://useconquest.com"
            className="text-gray-500 text-sm"
          >
            Conquest
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
