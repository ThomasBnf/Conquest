"use client";

import {
  Questions,
  QuestionsSchema,
} from "@/features/onboarding/schemas/workspace-form.schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { Plan } from "@conquest/zod/enum/plan.enum";
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

  const { mutateAsync: mutateWorkspace } = trpc.workspaces.update.useMutation({
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => update(),
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const { mutateAsync: createCustomer } =
    trpc.stripe.createCustomer.useMutation({
      onSuccess: () => update(),
      onError: (error) => {
        toast.error(error.message);
        setLoading(false);
      },
    });

  const { mutateAsync: createContact } = trpc.brevo.createContact.useMutation({
    onSuccess: () => router.push("/settings/integrations"),
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const form = useForm<Questions>({
    resolver: zodResolver(QuestionsSchema),
  });

  const onSubmit = async ({ company_size, source }: Questions) => {
    if (!user) return;
    setLoading(true);

    const plan = localStorage.getItem("plan") as Plan;
    const priceId = localStorage.getItem("priceId") as string;

    await mutateWorkspace({
      id: user.workspace_id,
      company_size,
      source,
    });

    if (plan && priceId) {
      await createCustomer({ plan, priceId });
      await mutateAsync({ id: user.id, onboarding: new Date() });
      await createContact({ user });

      localStorage.removeItem("plan");
      localStorage.removeItem("priceId");

      return router.push(`/${session?.user.workspace.slug}`);
    }

    router.push("/plan");
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>About you</CardTitle>
          <CardDescription>Tell us a bit about your company.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                name="company_size"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How large is your company?</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="just_me">Just me</SelectItem>
                          <SelectItem value="1-5">2-5</SelectItem>
                          <SelectItem value="5-25">6-25</SelectItem>
                          <SelectItem value="25-100">26-100</SelectItem>
                          <SelectItem value="100-250">101-250</SelectItem>
                          <SelectItem value="250-1000">251-1000</SelectItem>
                          <SelectItem value="1000+">1000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="source"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us?</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">Linkedin</SelectItem>
                          <SelectItem value="reddit">Reddit</SelectItem>
                          <SelectItem value="youtube">Youtube</SelectItem>
                          <SelectItem value="friend">
                            Recommended by a friend
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
      <StepsIndicator step={3} />
    </>
  );
}
