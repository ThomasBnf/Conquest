import { Hr, Link, Section } from "@react-email/components";

export const Footer = () => {
  return (
    <>
      <Hr className="my-6 border-neutral-200" />
      <Section className="flex items-center">
        <Link
          href="https://useconquest.com"
          className="mr-4 text-gray-400 text-sm"
        >
          Conquest
        </Link>
        <Link
          href="https://docs.useconquest.com"
          className="text-gray-400 text-sm"
        >
          Documentation
        </Link>
      </Section>
    </>
  );
};
