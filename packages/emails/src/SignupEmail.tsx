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
  url?: string;
};

export const SignupEmail = ({ url }: Props) => (
  <Html>
    <Tailwind>
      <Head />
      <Body className="bg-white font-sans">
        <Container className="mx-auto max-w-[560px] py-5 pb-12">
          <Heading className="pt-4 font-normal text-2xl leading-tight tracking-[-0.5px]">
            Your login code for Conquest
          </Heading>
          <Section className="py-7">
            <Button
              href={url}
              className="block rounded bg-[#5067D7] px-6 py-3 text-center font-semibold text-sm text-white no-underline"
            >
              Login to Conquest
            </Button>
          </Section>
          <Text className="mb-4 text-gray-700 text-sm leading-relaxed">
            This link and code will only be valid for the next 5 minutes. If the
            link does not work, you can use the login verification code
            directly:
          </Text>
          <Hr className="my-10 border-gray-200" />
          <Link href="https://linear.app" className="text-gray-400 text-sm">
            Conquest
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
