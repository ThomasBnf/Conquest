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
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { CommandLoading } from "cmdk";
import { Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type Props = {
  member: Member;
  onUpdate: (companyId: string | null) => void;
};

export const EditableCompany = ({ member, onUpdate }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};
  const [query, setQuery] = useState("");
  const [search, setSearch] = useDebounce(query, 500);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: company } = trpc.companies.get.useQuery(
    member.company_id ? { id: member.company_id } : skipToken,
  );

  const { data: companies, isLoading } =
    trpc.companies.getAllCompanies.useQuery({
      search,
    });

  const { mutateAsync: createCompany } = trpc.companies.post.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
      setOpen(false);
      setQuery("");
    },
  });

  const onUpdateMemberCompany = (newCompany: Company | null) => {
    if (company?.id === newCompany?.id) return;

    onUpdate(newCompany?.id ?? null);
    setQuery("");
  };

  const onCreateCompany = async () => {
    const company = await createCompany({ name: search, source: "Manual" });

    if (company) onUpdateMemberCompany(company);
  };

  useEffect(() => {
    setSearch(query);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="ghost"
          className="justify-start text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          {company?.name ? (
            <div
              className="flex h-6 items-center gap-2 rounded-md border border-main-200 bg-background px-1.5 text-main-400"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${slug}/companies/${member?.company_id}`);
              }}
            >
              {company.name}
              {open && (
                <X
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateMemberCompany(null);
                  }}
                />
              )}
            </div>
          ) : (
            " Set company"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command loop shouldFilter={false}>
          <CommandInput
            value={query}
            placeholder="Search company..."
            onValueChange={(value) => setQuery(value)}
          />

          {!search && <CommandEmpty>No companies found.</CommandEmpty>}
          <CommandList>
            <CommandGroup>
              {isLoading ? (
                <CommandLoading>
                  <Skeleton className="h-8 w-full" />
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
            {search && (
              <CommandGroup>
                <CommandItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={onCreateCompany}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && open) {
                        onCreateCompany();
                      }
                    }}
                  >
                    <Plus size={16} className="shrink-0" />
                    <span className="truncate">Create "{search}"</span>
                  </Button>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
