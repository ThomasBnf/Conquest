import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import { Skeleton } from "@conquest/ui/skeleton";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Check, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

type Props = {
  message: string;
};

export const TestDiscordMessage = ({ message }: Props) => {
  const { ref, inView } = useInView();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { mutateAsync, isPending } =
    trpc.workflows.sendDiscordTestMessage.useMutation({
      onSuccess: () => {
        toast.success("Test private message sent", { duration: 3500 });
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        setOpen(false);
        setSelectedMember(null);
        setSearch("");
      },
    });

  const { data, isLoading, fetchNextPage } = trpc.members.list.useInfiniteQuery(
    {
      search,
      id: "firstName",
      desc: true,
      groupFilters: {
        filters: [
          {
            id: "756b6873-1012-4b9e-b146-d28f8033a6a0",
            type: "select",
            field: "profiles",
            label: "Profiles",
            values: ["Discord"],
            operator: "contains",
          },
        ],
        operator: "AND",
      },
    },
    { getNextPageParam: (_, allPages) => allPages.length * 25 },
  );

  const members = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  const onSelectMember = (member: Member) => {
    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
    } else {
      setSelectedMember(member);
    }
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send size={16} />
          Test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a Discord test private message</DialogTitle>
          <DialogDescription>
            Choose a member to send a test private message
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search..."
            />
            <CommandList>
              <CommandGroup>
                {isLoading && <Skeleton className="h-8 w-full" />}
                {!isLoading && <CommandEmpty>No members found</CommandEmpty>}
                {members?.map((member) => (
                  <CommandItem
                    key={member.id}
                    className="flex items-center gap-2"
                    onSelect={() => onSelectMember(member)}
                  >
                    <Avatar className="size-7">
                      <AvatarImage src={member.avatarUrl ?? ""} />
                      <AvatarFallback className="text-sm">
                        {member.firstName?.charAt(0).toUpperCase()}
                        {member.lastName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex w-full flex-col text-xs">
                      {member.firstName} {member.lastName}
                      <span className="text-muted-foreground">
                        {member.primaryEmail}
                      </span>
                    </div>
                    {member.id === selectedMember?.id && (
                      <Check className="ml-auto size-4" />
                    )}
                  </CommandItem>
                ))}
                <div ref={ref} />
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogBody>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button
            onClick={() => {
              if (!selectedMember) return;

              mutateAsync({
                member: selectedMember,
                message,
              });
            }}
            disabled={!selectedMember || !message || isPending}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
