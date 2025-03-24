"use client";

import { env } from "@conquest/env";
import { Button, buttonVariants } from "@conquest/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Google } from "@conquest/ui/icons/Google";
import { Input } from "@conquest/ui/input";
import { SignupSchema } from "@conquest/zod/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EmailSuccess } from "./email-success";

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const form = useForm<SignupSchema>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async ({ email }: SignupSchema) => {
    setLoading(true);
    await signIn("resend", { email, redirect: false });
    setSentTo(email);
    setLoading(false);
  };

  const onGoogleSignup = async () => {
    setLoading(true);
    await signIn("google", {
      redirect: true,
      redirectTo: env.NEXT_PUBLIC_BASE_URL,
    });
  };

  if (sentTo) {
    return (
      <EmailSuccess
        sentTo={sentTo}
        setSentTo={setSentTo}
        buttonLabel="Back to signup"
      />
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Get started now</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@acme.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Signup
                  <ArrowRightIcon size={16} />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="mt-2 w-full"
              onClick={onGoogleSignup}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Google size={16} />
                  Sign up with Google
                </>
              )}
            </Button>
            <div className="mt-2 flex w-full items-center justify-start text-xs">
              <p className="text-muted-foreground">Have an account?</p>
              <Link
                href="/auth/login"
                className={buttonVariants({ variant: "link", size: "xs" })}
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
