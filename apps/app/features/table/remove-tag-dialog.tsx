import { useTable } from "@/hooks/useTable";
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
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props<TData extends Member | Company> = {
  open: boolean;
  setOpen: (open: boolean) => void;
  table: ReturnType<typeof useTable<TData>>;
};

export const RemoveTagDialog = <TData extends Member | Company>({
  open,
  setOpen,
  table,
}: Props<TData>) => {
  const { data: tags } = trpc.tags.list.useQuery();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedRows, onReset } = table;
  const utils = trpc.useUtils();

  const { mutateAsync: updateManyMembers } =
    trpc.members.updateManyMembers.useMutation({
      onSuccess: () => {
        utils.members.list.invalidate();
        setSelectedTags([]);
        setOpen(false);
        setLoading(false);
        onReset();
      },
    });

  const { mutateAsync: updateManyCompanies } =
    trpc.companies.updateManyCompanies.useMutation({
      onSuccess: () => {
        utils.companies.list.invalidate();
        setSelectedTags([]);
        setOpen(false);
        setLoading(false);
        onReset();
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

    if (selectedRows?.[0] && "first_name" in selectedRows[0]) {
      const members = selectedRows as Member[];

      const updatedMembers = members.map((member) => ({
        ...member,
        tags: member.tags.filter((tag) => !selectedTags.includes(tag)),
        updated_at: new Date(),
      }));

      await updateManyMembers({ members: updatedMembers });
      return;
    }

    const companies = selectedRows as Company[];

    const updatedCompanies = companies.map((company) => ({
      ...company,
      tags: company.tags.filter((tag) => !selectedTags.includes(tag)),
      updated_at: new Date(),
    }));

    await updateManyCompanies({ companies: updatedCompanies });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove tags</DialogTitle>
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
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
