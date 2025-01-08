import { updateMemberCompany } from "@/actions/members/updateMemberCompany";
import { listAllMembers } from "@/client/members/listAllMembers";
import { useUser } from "@/context/userContext";
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
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import type { CompanyWithMembers } from "@conquest/zod/schemas/company.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

type Props = {
  company: CompanyWithMembers;
};

export const EditableMembers = ({ company }: Props) => {
  const { slug } = useUser();
  const { ref, inView } = useInView();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [companyMembers, setCompanyMembers] = useState<Member[]>(
    company.members ?? [],
  );

  const { members, hasNextPage, fetchNextPage, isLoading } = listAllMembers({
    search,
  });

  const onUpdate = async (memberId: string) => {
    const isMemberInCompany = companyMembers?.some(
      (member) => member.id === memberId,
    );

    const response = await updateMemberCompany({
      id: memberId,
      company_id: isMemberInCompany ? null : company.id,
    });

    if (response?.serverError) {
      return toast.error(response.serverError);
    }

    setSearch("");
    setCompanyMembers((prev) =>
      isMemberInCompany
        ? prev.filter((member) => member.id !== memberId)
        : [...prev, members?.find((member) => member.id === memberId)!],
    );
    queryClient.invalidateQueries({
      queryKey: ["activities", company.id],
    });
    toast.success(
      isMemberInCompany
        ? "Member removed from company"
        : "Member added to company",
    );
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {companyMembers && companyMembers.length > 0 ? (
          <div className="flex w-full flex-col gap-1 rounded-md p-1 hover:bg-muted">
            {companyMembers.map((member) => {
              return (
                <Button
                  key={member.id}
                  variant="outline"
                  size="xs"
                  className="w-fit max-w-[225px] justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${slug}/members/${member.id}`);
                  }}
                >
                  <span className="truncate">
                    {member.first_name} {member.last_name}
                  </span>
                  {open && (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(member.id);
                      }}
                    >
                      <X size={15} />
                    </div>
                  )}
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
      <PopoverContent align="start" className="w-[233px] p-0">
        <Command loop shouldFilter={false}>
          <CommandInput
            placeholder="Search company..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandGroup>
              {isLoading && <Skeleton className="h-8 w-full" />}
              {!isLoading && <CommandEmpty>No members found</CommandEmpty>}
              {members
                ?.filter((member) => member.company_id !== company.id)
                .map((member) => (
                  <CommandItem
                    key={member.id}
                    onSelect={() => {
                      setOpen(false);
                      onUpdate(member.id);
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
                      {member.first_name} {member.last_name}
                      <span className="text-muted-foreground">
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
