import { LogoType } from "@conquest/ui/brand/logo-type";
import { buttonVariants } from "@conquest/ui/button";
import { Slack } from "@conquest/ui/icons/Slack";
import { Label } from "@conquest/ui/label";
import Link from "next/link";
import { MenuLink } from "./MenuLink";
import { Container, Section } from "./Section";

export const Footer = () => {
  return (
    <Section>
      <Container className="flex-col">
        <LogoType width={150} height={30} />
        <nav className="mt-16 flex w-full items-start justify-between gap-20">
          <div className="flex gap-32">
            <div className="flex flex-col">
              <Label className="mb-6 text-base">Links</Label>
              <div className="flex flex-col gap-4">
                <MenuLink href="#problem" label="Problem" block="center" />
                <MenuLink href="#benefits" label="Benefits" block="start" />
                <MenuLink href="#use-cases" label="Use Cases" block="center" />
                <MenuLink
                  href="#how-it-works"
                  label="How it works"
                  block="start"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <Label className="mb-6 text-base">Social</Label>
              <div className="flex flex-col gap-4">
                <Link
                  href="https://x.com/ThomasBonfils"
                  className="hover:underline"
                >
                  Twitter
                </Link>
                <Link
                  href="https://www.linkedin.com/in/thomas-bonfils/"
                  className="hover:underline"
                >
                  Linkedin
                </Link>
                <Link
                  href="mailto:thomas.bnfls@gmail.com"
                  className="hover:underline"
                >
                  Mail
                </Link>
              </div>
            </div>
          </div>
          <div className="flex h-fit w-full max-w-sm flex-col gap-4 rounded-md border bg-sidebar p-4 shadow-sm">
            <Slack size={24} />
            <p className="font-semibold text-xl">Join our Slack Community</p>
            <Link
              className={buttonVariants({ variant: "brand", size: "md" })}
              href="https://join.slack.com/t/useconquest/shared_invite/zt-2x4fg4fut-7k0G3_D649TkfPc5WIPdgA"
            >
              Become a member
            </Link>
          </div>
        </nav>
      </Container>
    </Section>
  );
};
