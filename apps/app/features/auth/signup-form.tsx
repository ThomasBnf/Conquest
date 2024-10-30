"use client";

import { createUser } from "@/features/auth/actions/createUser";
import { logIn } from "@/features/auth/actions/loginIn";
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
import { SignupSchema } from "@conquest/zod/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
export const SignupForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupSchema>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: SignupSchema) => {
    setLoading(true);

    const rUser = await createUser({ email, password });
    const user = rUser?.data;
    const error = rUser?.serverError;

    if (error) {
      setLoading(false);
      toast.error(error);
    }

    if (user) await logIn({ email, password, redirectTo: "/" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="p-8">
        <CardTitle>Get started now</CardTitle>
        <CardDescription>Create your Conquest account</CardDescription>
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
              Signup
              <ArrowRightIcon size={16} />
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
