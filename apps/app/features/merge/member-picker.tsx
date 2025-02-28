import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { MemberDetails } from "../members/member-details";

type Props = {
  currentMember?: Member;
  onSelect: (member: Member) => void;
};

export const MemberPicker = ({ currentMember, onSelect }: Props) => {
  const { first_name } = currentMember ?? {};
  const { ref, inView } = useInView();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(first_name ?? "");
  const [search, setSearch] = useDebounce(query, 500);

  const { data, isLoading, fetchNextPage, hasNextPage } =
    trpc.members.getAllMembers.useInfiniteQuery(
      { search, take: 10 },
      { getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id },
    );

  const members = data?.pages.flatMap((page) => page.map((member) => member));

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button>
          <Plus size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command loop shouldFilter={false}>
          <CommandInput
            placeholder="Search member..."
            value={query}
            onValueChange={(value) => setQuery(value ?? "")}
          />
          <CommandList>
            <CommandGroup>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <CommandEmpty>No members found</CommandEmpty>
              )}
              {members
                ?.filter((member) => member.id !== currentMember?.id)
                ?.map((member) => (
                  <CommandItem
                    key={member.id}
                    onSelect={() => {
                      setOpen(false);
                      onSelect(member);
                    }}
                    className="flex items-center gap-2"
                  >
                    <MemberDetails member={member} />
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
