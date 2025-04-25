import { trpc } from "@/server/client";
import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { CommandLoading } from "cmdk";
import { Building2, Ellipsis, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
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
  const [openMenu, setOpenMenu] = useState(false);
  const { ref, inView } = useInView();

  const utils = trpc.useUtils();

  const { data: company } = trpc.companies.get.useQuery(
    member.companyId ? { id: member.companyId } : skipToken,
  );

  const { data, isLoading, fetchNextPage } =
    trpc.companies.listInfinite.useInfiniteQuery(
      { search },
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

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

  const companies = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="group w-full">
        {company?.name ? (
          <div
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "flex cursor-pointer items-center justify-between gap-2 px-2",
            )}
          >
            <Link
              href={`/${slug}/companies/${company.id}`}
              className="group/company flex h-8 items-center gap-2 truncate"
              prefetch
            >
              <Building2 size={16} className="shrink-0 text-muted-foreground" />
              <p className="truncate group-hover/company:underline">
                {company.name}
              </p>
            </Link>
            <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
              <DropdownMenuTrigger
                asChild
                className={cn(
                  "shrink-0 transition-opacity",
                  openMenu
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                )}
              >
                <Button variant="outline" size="icon_sm">
                  <Ellipsis size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdateMemberCompany(null)}>
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="justify-start text-muted-foreground"
          >
            <Building2 size={16} />
            Set company
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
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
              <>
                <Separator />
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
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
