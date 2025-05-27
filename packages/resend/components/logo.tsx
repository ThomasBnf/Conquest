import { Img, Section } from "@react-email/components";

export const Logo = () => {
  return (
    <Section className="mt-8">
      <Img
        src="https://conquest-brand.s3.eu-central-1.amazonaws.com/Orange%20-%20Icone%402x.png"
        width="32"
        height="32"
        alt="Conquest"
      />
    </Section>
  );
};
