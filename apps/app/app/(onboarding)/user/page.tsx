"use client";

import {
  UserForm,
  UserFormSchema,
} from "@/features/onboarding/schemas/user-form.schema";
import { StepsIndicator } from "@/features/onboarding/steps-indicator";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Page() {
  const { data: session, update } = useSession();
  const { user } = session ?? {};
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.users.update.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      update();
      router.push("/workspace");
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const form = useForm<UserForm>({
    resolver: zodResolver(UserFormSchema),
  });

  const onSubmit = async ({ first_name, last_name }: UserForm) => {
    if (!user) return;

    await mutateAsync({
      id: user.id,
      first_name,
      last_name,
    });
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Conquest</CardTitle>
          <CardDescription>Tell us a bit about yourself.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                name="first_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Thomas" autoFocus />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="last_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bonfils" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Suivant
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <StepsIndicator step={1} />
    </>
  );
}
