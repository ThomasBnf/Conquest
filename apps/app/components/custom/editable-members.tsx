import { updateMemberCompany } from "@/actions/members/updateMemberCompany";
import { useUser } from "@/context/userContext";
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
import { Skeleton } from "@conquest/ui/skeleton";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  company: Company;
};

export const EditableMembers = ({ company }: Props) => {
  const { slug } = useUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: members, isLoading } = useListAllMembers();
  const [companyMembers, setCompanyMembers] = useState<Member[]>([]);

  const onUpdate = async (memberId: string) => {
    const isMemberInCompany = companyMembers?.some(
      (member) => member.id === memberId,
    );

    const response = await updateMemberCompany({
      id: memberId,
      company_id: isMemberInCompany ? null : company.id,
    });

    if (response?.serverError) {
      toast.error(response.serverError);
      return;
    }

    setCompanyMembers((prev) =>
      isMemberInCompany
        ? prev.filter((member) => member.id !== memberId)
        : [...prev, members?.find((member) => member.id === memberId)!],
    );
    toast.success(
      isMemberInCompany
        ? "Member removed from company"
        : "Member added to company",
    );
  };

  useEffect(() => {
    setCompanyMembers(
      members?.filter((member) => member.company_id === company.id) ?? [],
    );
  }, [members, company.id]);

  if (isLoading) return <Skeleton className="h-5 w-24" />;

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
                  className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${slug}/members/${member.id}`);
                  }}
                >
                  {member.first_name} {member.last_name}
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
