import { useUser } from "@/context/userContext";
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
import { CommandLoading } from "cmdk";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";

type Props = {
  member: Member;
  onUpdate: (companyId: string | null) => void;
};

export const EditableCompany = ({ member, onUpdate }: Props) => {
  const { slug } = useUser();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useDebounce(query, 500);
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView();

  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: company } = trpc.companies.get.useQuery({
    id: member.company_id,
  });

  const { data, isLoading, fetchNextPage } =
    trpc.companies.getAllCompanies.useInfiniteQuery({
      search,
      take: 25,
    });

  const companies = data?.pages.flatMap((page) => page ?? []);

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
    const company = await createCompany({ name: search });

    if (company) onUpdateMemberCompany(company);
  };

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [inView]);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {company?.name ? (
          <div className="h-8 rounded-md p-1 hover:bg-muted">
            <Button
              variant="outline"
              size="xs"
              className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${slug}/companies/${member?.company_id}`);
              }}
            >
              {company.name}
              {open && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateMemberCompany(null);
                  }}
                >
                  <X size={16} />
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
      <PopoverContent align="start" className="w-[233px] p-0">
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
              <div ref={ref} />
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
