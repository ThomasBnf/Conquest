"use client";

import { Button } from "@conquest/ui/button";
import { signOut } from "next-auth/react";
import { SignOut } from "../icons/SignOut";

export const Logout = () => {
  const onClick = async () => {
    signOut({ callbackUrl: "/auth/login", redirect: true });
  };

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full hover:bg-active"
      classNameSpan="justify-start"
    >
      <SignOut className="size-[18px]" />
      Logout
    </Button>
  );
};
