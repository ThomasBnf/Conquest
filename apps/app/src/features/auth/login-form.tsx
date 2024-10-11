"use client";

import { logIn } from "@/actions/auth";
import { type Login, LoginSchema } from "@/schemas/auth.schema";
import { Button, buttonVariants } from "@conquest/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<Login>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: Login) => {
    setLoading(true);

    const rSigin = await logIn({ email, password });
    const error = rSigin?.serverError || rSigin?.data?.error;

    if (error) {
      setLoading(false);
      toast.error(error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="p-8">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Login to your Conquest account</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 p-8 pt-0">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="w-full flex-col p-8 pt-0">
            <Button type="submit" loading={loading} className="w-full">
              Login
              <ArrowRightIcon size={16} />
            </Button>
            <div className="mt-2 flex w-full items-center justify-start text-xs">
              <p className="text-muted-foreground">
                Don&apos;t have an account?
              </p>
              <Link
                href="/auth/signup"
                className={buttonVariants({ variant: "link" })}
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
