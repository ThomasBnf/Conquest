import { useUser } from "@/context/userContext";
import { _listAllMembers } from "@/features/members/actions/_listAllMembers";
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
import { Skeleton } from "@conquest/ui/skeleton";
import type { CompanyWithMembers } from "@conquest/zod/company.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  company: CompanyWithMembers;
};

export const EditableMembers = ({ company }: Props) => {
  const { slug } = useUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const rMembers = await _listAllMembers();
      return rMembers?.data;
    },
  });

  if (isLoading) return <Skeleton className="h-5 w-24" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {company.members.length > 0 ? (
          <div className="flex w-full flex-col gap-1 rounded-md p-1 hover:bg-muted">
            {company.members.map((member) => {
              return (
                <Button
                  key={member.id}
                  variant="outline"
                  size="xs"
                  className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${slug}/members/${member.id}`);
                  }}
                >
                  {member.full_name}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            className="h-8"
            classNameSpan="text-muted-foreground justify-start"
            onClick={() => setOpen(true)}
          >
            Set company
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[297px] p-0">
        <Command loop>
          <CommandInput placeholder="Search company..." />
          <CommandList>
            <CommandGroup>
              {members
                ?.filter((member) => member.company_id !== company.id)
                .map((member) => (
                  <CommandItem
                    key={member.id}
                    onSelect={() => {
                      setOpen(false);
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
                    <div className="flex w-full flex-col text-xs">
                      {member.full_name}
                      <span className="text-muted-foreground">
                        {member.emails[0]}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
