import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import { Member } from "@conquest/zod/schemas/member.schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
  value: Member | undefined;
  onChange: (member: Member) => void;
};

export const MemberPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { ref, inView } = useInView();

  const { data, isLoading, fetchNextPage } =
    trpc.members.listInfinite.useInfiniteQuery(
      { search },
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

  const members = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {value ? (
            <span>
              {value.firstName} {value.lastName}
            </span>
          ) : (
            <span className="text-muted-foreground">Member</span>
          )}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command loop shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandGroup>
              {isLoading && <Skeleton className="h-8 w-full" />}
              {!isLoading && <CommandEmpty>No members found</CommandEmpty>}
              {members?.map((member) => (
                <CommandItem
                  key={member.id}
                  onSelect={() => {
                    setOpen(false);
                    onChange(member);
                  }}
                  className="flex items-center gap-2"
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
                </CommandItem>
              ))}
              <div ref={ref} />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
