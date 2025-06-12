import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
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
import type { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
  company: Company;
};

export const EditableMembers = ({ company }: Props) => {
  const { slug } = useWorkspace();
  const { ref, inView } = useInView();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data: companyMembers } = trpc.companies.listCompanyMembers.useQuery({
    companyId: company.id,
  });

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    onSuccess: () => {
      utils.companies.listCompanyMembers.invalidate({ companyId: company.id });
      utils.activities.list.invalidate({ companyId: company.id });
    },
  });

  const { data, isLoading, fetchNextPage } =
    trpc.members.listInfinite.useInfiniteQuery(
      { search },
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

  const members = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  const onUpdate = async (member: Member, companyId: string | null) => {
    await updateMember({
      ...member,
      companyId,
    });
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <>
      {companyMembers && companyMembers.length > 0 && (
        <div className="flex flex-col gap-1">
          {companyMembers.map((member) => (
            <Button
              key={member.id}
              variant="ghost"
              className="group -ml-[8px] flex items-center justify-between"
            >
              <Link
                key={member.id}
                href={`/${slug}/members/${member.id}/analytics`}
                className="hover:underline"
                prefetch
              >
                <p>
                  {member.firstName} {member.lastName}
                </p>
              </Link>
              <Button
                size="icon_sm"
                variant="outline"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => onUpdate(member, null)}
              >
                <X size={16} />
              </Button>
            </Button>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="-ml-[7px] w-full cursor-pointer">
          <Button
            variant="ghost"
            size="xs"
            className="h-8 justify-start px-[7px] text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            Add member
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command loop shouldFilter={false}>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandGroup>
                {isLoading && <Skeleton className="h-8 w-full" />}
                {!isLoading && <CommandEmpty>No members found</CommandEmpty>}
                {members
                  ?.filter(
                    (member) =>
                      !companyMembers?.some((m) => m.id === member.id),
                  )
                  ?.map((member) => (
                    <CommandItem
                      key={member.id}
                      onSelect={() => onUpdate(member, company.id)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-7">
                        <AvatarImage src={member.avatarUrl ?? ""} />
                        <AvatarFallback className="text-sm">
                          {member.firstName?.charAt(0).toUpperCase()}
                          {member.lastName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex w-full flex-col text-xs">
                        {member.firstName} {member.lastName}
                        <span className="text-muted-foreground">
                          {member.primaryEmail}
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
    </>
  );
};
