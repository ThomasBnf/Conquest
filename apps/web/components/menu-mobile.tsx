"use client";

import { LogoType } from "@conquest/ui/brand/logo-type";
import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import Link from "next/link";
import { useRef, useState } from "react";
import menu from "../public/menu.json";

export const MenuBar = () => {
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

  return (
    <>
      <div className="fixed inset-x z-20 flex w-full items-center justify-between px-4 py-3 backdrop-blur-md">
        <LogoType width={120} height={24} />
        <div className="flex items-center gap-4">
          <Button variant="ghost">Login</Button>
          <Button variant="outline">Signup</Button>
          <Lottie
            lottieRef={lottieRef}
            animationData={menu}
            className="size-8 cursor-pointer"
            loop={false}
            autoplay={false}
            onClick={handleClick}
          />
        </div>
      </div>
      <div
        className={cn(
          "fixed top-0 z-10 flex h-full w-full flex-col bg-background pt-14 transition-transform duration-300",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <Separator />
        <div className="flex h-full flex-col p-4">
          <div className="flex flex-col divide-y">
            <Link
              href="/features"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start rounded-none text-base",
              )}
            >
              Features
            </Link>
            <Link
              href="/integrations"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start rounded-none text-base",
              )}
            >
              Integrations
            </Link>
            <Link
              href="/documentation"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                " justify-start rounded-none text-base",
              )}
            >
              Documentation
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start rounded-none text-base",
              )}
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
