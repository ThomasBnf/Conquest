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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

type Props = {
  company: Company;
};

export const EditableMembers = ({ company }: Props) => {
  const { slug } = useWorkspace();
  const { ref, inView } = useInView();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
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

  const onUpdate = async (memberId: string) => {
    const member = companyMembers?.find((member) => member.id === memberId);
    const isInCompany = member?.companyId === company.id;

    if (!isInCompany) return;

    await updateMember({
      ...member,
      companyId: isInCompany ? null : company.id,
    });

    toast.success(
      isInCompany ? "Member removed from company" : "Member added to company",
    );
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="-ml-[9px] w-full cursor-pointer">
        {companyMembers && companyMembers?.length > 0 ? (
          <div className="flex w-full flex-col gap-1 rounded-md p-1 hover:bg-muted">
            {companyMembers?.map((member) => (
              <Button
                key={member.id}
                variant="ghost"
                size="xs"
                className="w-fit justify-start hover:underline"
              >
                <Link href={`/${slug}/members/${member.id}/analytics`} prefetch>
                  {member.firstName} {member.lastName}
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            className="h-8 justify-start px-[7px] text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            Set members
          </Button>
        )}
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
              {members?.map((member) => (
                <CommandItem
                  key={member.id}
                  onSelect={() => {
                    setOpen(false);
                    onUpdate(member.id);
                  }}
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
  );
};
