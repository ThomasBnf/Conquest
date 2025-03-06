import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import type { Table } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props<TData> = {
  table: Table<TData>;
};

export const AddTagDialog = <TData,>({ table }: Props<TData>) => {
  const { data: tags } = trpc.tags.list.useQuery();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const isCompanyPage = pathname.includes("companies");
  const utils = trpc.useUtils();

  const rowSelected = table.getSelectedRowModel().rows;

  const { mutateAsync: updateManyMembers } =
    trpc.members.updateManyMembers.useMutation({
      onSuccess: () => {
        utils.members.list.invalidate();
        setSelectedTags([]);
        setOpen(false);
        setLoading(false);
        table.setRowSelection({});
      },
    });

  const { mutateAsync: updateManyCompanies } =
    trpc.companies.updateManyCompanies.useMutation({
      onSuccess: () => {
        utils.companies.list.invalidate();
        setSelectedTags([]);
        setOpen(false);
        setLoading(false);
        table.setRowSelection({});
      },
    });

  const onSelect = (tagId: string) => {
    setSelectedTags((prevTags) => {
      const updatedTags = prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId];
      return updatedTags;
    });
  };

  const onConfirm = async () => {
    setLoading(true);

    if (isCompanyPage) {
      const companies = CompanySchema.array().parse(
        rowSelected.map((row) => row.original),
      );

      const updatedCompanies = companies.map((company) => ({
        ...company,
        tags: [...company.tags, ...selectedTags],
      }));

      updateManyCompanies({ companies: updatedCompanies });
    } else {
      const members = MemberSchema.array().parse(
        rowSelected.map((row) => row.original),
      );

      const updatedMembers = members.map((member) => ({
        ...member,
        tags: [...member.tags, ...selectedTags],
      }));

      updateManyMembers({ members: updatedMembers });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="dark">Add tag</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
        </DialogHeader>
        <DialogBody className="p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags?.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => onSelect(tag.id)}
                    className="gap-2"
                  >
                    <Checkbox checked={selectedTags.includes(tag.id)} />
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogBody>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button
            onClick={onConfirm}
            disabled={selectedTags.length === 0 || loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>Add tag{selectedTags.length > 1 ? "s" : ""}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
