import { useUser } from "@/context/userContext";
import { useListCompanies } from "@/queries/hooks/useListCompanies";
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
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { CommandLoading } from "cmdk";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  member: MemberWithCompany;
  onUpdate: (value: string | null) => void;
};

export const EditableCompany = ({ member, onUpdate }: Props) => {
  const { slug } = useUser();
  const [memberCompany, setMemberCompany] = useState(member.company_name);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: companies, isLoading } = useListCompanies();

  const onUpdateMemberCompany = (company: Company | null) => {
    if (company === memberCompany) return;
    setMemberCompany(company?.name ?? null);
    onUpdate(company?.id ?? null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {memberCompany ? (
          <div className="h-8 rounded-md p-1 hover:bg-muted">
            <Button
              variant="outline"
              size="xs"
              className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${slug}/companies/${member.company_id}`);
              }}
            >
              {memberCompany}
              {open && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateMemberCompany(null);
                  }}
                >
                  <X size={15} />
                </div>
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
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
              {isLoading ? (
                <CommandLoading>
                  <Skeleton className="h-6 w-full" />
                </CommandLoading>
              ) : (
                companies?.map((company) => (
                  <CommandItem
                    key={company.id}
                    onSelect={() => {
                      setOpen(false);
                      onUpdateMemberCompany(company);
                    }}
                  >
                    {company.name}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
