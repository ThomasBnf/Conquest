import { useListAllMembers } from "@/queries/hooks/useListAllMembers";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
  currentMember?: MemberWithCompany;
  onSelect: (member: MemberWithCompany) => void;
};

export const MemberPicker = ({ currentMember, onSelect }: Props) => {
  const { first_name } = currentMember ?? {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(`${first_name}`);
  const { ref, inView } = useInView();

  const { data, hasNextPage, fetchNextPage } = useListAllMembers({
    search,
  });

  const members = data?.pages.flat();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  console.log(search);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button>
          <Plus size={15} />
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
                    <Avatar className="size-7">
                      <AvatarImage src={member.avatar_url ?? ""} />
                      <AvatarFallback className="text-sm">
                        {member.first_name?.charAt(0).toUpperCase()}
                        {member.last_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex w-full flex-col">
                      <p>
                        {member.first_name} {member.last_name}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {member.primary_email}
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
