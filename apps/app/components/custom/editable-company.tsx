import { useUser } from "@/context/userContext";
import { _getCompany } from "@/features/companies/actions/_getCompany";
import { _listCompanies } from "@/features/companies/actions/_listCompanies";
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
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  defaultValue: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableCompany = ({ defaultValue, onUpdate }: Props) => {
  const { slug } = useUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const rCompanies = await _listCompanies({
        name: "",
        page: 1,
        id: "name",
        desc: false,
      });
      return rCompanies?.data;
    },
  });

  const { data: company, isLoading } = useQuery({
    queryKey: ["company", defaultValue],
    queryFn: async () => {
      const rCompany = await _getCompany({ id: defaultValue });
      return rCompany?.data;
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {isLoading ? (
          <div className="h-[32.5px] rounded-md p-1">
            <Skeleton className="h-6 w-24" />
          </div>
        ) : company ? (
          <div className="h-[32.5px] rounded-md p-1 hover:bg-muted">
            <Button
              variant="outline"
              size="xs"
              className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${slug}/companies/${company.id}`);
              }}
            >
              {company.name}
              {open && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(null);
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
              {companies?.map((company) => (
                <CommandItem
                  key={company.id}
                  onSelect={() => {
                    onUpdate(company.id);
                    setOpen(false);
                  }}
                >
                  {company.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
