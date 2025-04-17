"use client";

import { LogoType } from "@conquest/ui/brand/logo-type";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { useIsMobile } from "@conquest/ui/hooks/use-mobile";
import { Separator } from "@conquest/ui/separator";
import { type LottieRefCurrentProps } from "lottie-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import menu from "../../public/menu.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const Menu = () => {
  const isMobile = useIsMobile();
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [direction, setDirection] = useState(1);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!lottieRef.current?.animationLoaded) return;

    lottieRef.current.setDirection(direction as 1 | -1);
    lottieRef.current.setSpeed(3);
    lottieRef.current.play();

    setOpen(!open);
    setDirection((prev) => prev * -1);
  };

  const links = [
    {
      href: "/pricing",
      label: "Pricing",
    },
    {
      href: "/integrations",
      label: "Integrations",
    },
    {
      href: "https://join.slack.com/t/useconquest/shared_invite/zt-2x4fg4fut-7k0G3_D649TkfPc5WIPdgA",
      label: "Community",
    },
    {
      href: "/documentation",
      label: "Documentation",
    },
  ];

  return (
    <>
      <div className="fixed inset-x z-20 flex w-full items-center justify-between px-4 py-3 backdrop-blur-md">
        <Link href="https://useconquest.com">
          <LogoType width={120} height={24} />
        </Link>
        <div className="flex items-center gap-4">
          {!isMobile && (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  {link.label}
                </Link>
              ))}
              <Separator orientation="vertical" className="h-4" />
            </>
          )}
          <Link
            href="https://app.useconquest.com/auth/login"
            className={buttonVariants({ variant: "ghost" })}
          >
            Login
          </Link>
          <Link
            href="https://app.useconquest.com/auth/signup"
            className={buttonVariants({ variant: "outline" })}
          >
            Signup
          </Link>
          {isMobile && (
            <Lottie
              lottieRef={lottieRef}
              animationData={menu}
              className="size-8 cursor-pointer"
              loop={false}
              autoplay={false}
              onClick={handleClick}
            />
          )}
        </div>
      </div>
      <div
        className={cn(
          "fixed top-0 z-10 flex h-full w-full flex-col bg-background pt-14 transition-transform duration-300",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <Separator />
        <div className="flex h-full flex-col">
          <div className="flex flex-col divide-y">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "justify-start rounded-none px-4 text-base",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 p-4">
            <Link
              href="https://cal.com/audrey-godard-conquest/30min"
              className={cn(
                buttonVariants({ variant: "outline", size: "md" }),
                "w-full",
              )}
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
