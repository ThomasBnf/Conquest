import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { TextField } from "@conquest/ui/text-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TeamForm, TeamFormSchema } from "./schemas/team.schema";

export const InviteUser = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<TeamForm>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: {
      emails: "",
    },
  });

  const { mutateAsync } = trpc.team.invite.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
      toast.success("Invites sent");
      form.reset();
    },
    onError: () => {
      setLoading(false);
      toast.error("Failed to invite members");
    },
  });

  const onSubmit = async ({ emails }: TeamForm) => {
    await mutateAsync({ emails });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Invite to your workspace</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emails</FormLabel>
                    <FormControl>
                      <TextField
                        placeholder="email@example.com, email2@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate each email with a comma
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="size-4 animate-spin" />
                ) : (
                  "Send invites"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
