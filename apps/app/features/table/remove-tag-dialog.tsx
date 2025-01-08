import { removeTagsCompanies } from "@/actions/members/removeTagsCompanies";
import { removeTagsMembers } from "@/actions/members/removeTagsMembers";
import { listTags } from "@/client/tags/listTags";
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
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  rowSelected: string[];
  setRowSelected: (ids: string[]) => void;
  table: "members" | "companies";
};

export const RemoveTagDialog = ({
  rowSelected,
  setRowSelected,
  table,
}: Props) => {
  const { data: tags } = listTags();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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

    if (table === "members") {
      const response = await removeTagsMembers({
        ids: rowSelected,
        tags: selectedTags,
      });
      const error = response?.serverError;

      if (error) toast.error(error);
    } else {
      const response = await removeTagsCompanies({
        ids: rowSelected,
        tags: selectedTags,
      });
      const error = response?.serverError;

      if (error) toast.error(error);
    }

    toast.success("Tags removed");
    queryClient.invalidateQueries({ queryKey: [table] });

    setRowSelected([]);
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="dark">Remove tag</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove tag</DialogTitle>
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
          <Button onClick={onConfirm} loading={loading} disabled={loading}>
            Remove tag{selectedTags.length > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
