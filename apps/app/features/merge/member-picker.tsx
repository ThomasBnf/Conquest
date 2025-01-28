import { listAllMembers } from "@/client/members/listAllMembers";
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
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { MemberDetails } from "../members/member-details";

type Props = {
  currentMember?: MemberWithCompany;
  onSelect: (member: MemberWithCompany) => void;
};

export const MemberPicker = ({ currentMember, onSelect }: Props) => {
  const { first_name } = currentMember ?? {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(`${first_name}`);
  const { ref, inView } = useInView();

  const { data, hasNextPage, fetchNextPage, isLoading } = listAllMembers({
    search,
  });

  const members = data?.pages.flat();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

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
            value={search}
            onValueChange={(value) => setSearch(value ?? "")}
          />
          <CommandList>
            <CommandGroup>
              {isLoading && <Skeleton className="h-8 w-full" />}
              {!isLoading && <CommandEmpty>No members found</CommandEmpty>}
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
