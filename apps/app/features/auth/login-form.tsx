"use client";

import { Google } from "@/components/icons/Google";
import { sleep } from "@/helpers/sleep";
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
import { Input } from "@conquest/ui/input";
import { type Login, LoginSchema } from "@conquest/zod/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<Login>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async ({ email }: Login) => {
    setLoading(true);
    await signIn("resend", { email, redirect: false });
    await sleep(1000);
    toast.success("Check your email for a login code");
    setLoading(false);
  };

  const onGoogleSignup = async () => {
    setLoading(true);
    await signIn("google", {
      redirect: true,
      redirectTo: env.NEXT_PUBLIC_BASE_URL,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
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
          <CardFooter className="flex flex-col">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Login
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
                  Login with Google
                </>
              )}
            </Button>
            <div className="mt-2 flex w-full items-center justify-start text-xs">
              <p className="text-muted-foreground">
                Don&apos;t have an account?
              </p>
              <Link
                href="/auth/signup"
                className={buttonVariants({ variant: "link", size: "xs" })}
              >
                Signup
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
