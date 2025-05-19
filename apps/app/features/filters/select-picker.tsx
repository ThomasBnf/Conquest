import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { SourceBadge } from "@/components/badges/source-badge";
import { useFilters } from "@/context/filtersContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "../../../../packages/ui/src/lib/utils";
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
import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type FilterSelect,
  FilterSelectSchema,
} from "@conquest/zod/schemas/filters.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { countries } from "country-data-list";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "../tags/tag-badge";

type Props = {
  filter: FilterSelect;
};

export const SelectPicker = ({ filter }: Props) => {
  const { field, values } = filter;
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between", field === "tags" && "p-1")}
        >
          {field === "country" && <ValueCountry filter={filter} />}
          {field === "language" && <ValueLanguage filter={filter} />}
          {field === "profiles" && <ValueProfiles filter={filter} />}
          {field === "source" && <ValueSource filter={filter} />}
          {field === "tags" && <ValueTag filter={filter} />}
          {!values.length && (
            <span className="text-muted-foreground">Select</span>
          )}
          <ChevronDown size={16} className="ml-auto text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-fit p-0">
        <Command loop>
          <CommandInput placeholder="Search..." />
          {field === "country" && <CountryGroup filter={filter} />}
          {field === "language" && <LanguageGroup filter={filter} />}
          {field === "profiles" && <ProfilesGroup filter={filter} />}
          {field === "source" && <SourcesGroup filter={filter} />}
          {field === "tags" && <TagsGroup filter={filter} />}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ValueCountry = ({ filter }: { filter: FilterSelect }) => {
  const { values } = filter;
  const { data: countries } = trpc.members.listCountries.useQuery();

  return (
    <div className="flex max-w-64 items-center gap-1">
      {values.slice(0, 1).map((value) => {
        const country = countries?.find((country) => country === value);
        return country ? (
          <CountryBadge key={value} country={country} transparent />
        ) : null;
      })}
      {values.length > 1 && (
        <p className="ml-1 text-xs">+{values.length - 1}</p>
      )}
    </div>
  );
};

const ValueLanguage = ({ filter }: { filter: FilterSelect }) => {
  const { values } = filter;
  const { data: languages } = trpc.members.listLanguages.useQuery();

  return (
    <div className="flex max-w-64 items-center gap-1">
      {values.slice(0, 1).map((value) => {
        const language = languages?.find((language) => language === value);
        return language ? (
          <LanguageBadge key={value} language={language} transparent />
        ) : null;
      })}
      {values.length > 1 && (
        <p className="ml-1 text-xs">+{values.length - 1}</p>
      )}
    </div>
  );
};

const ValueProfiles = ({ filter }: { filter: FilterSelect }) => {
  const { values } = filter;
  const { data: sources } = trpc.members.listSourcesProfile.useQuery();

  return (
    <div className="flex max-w-64 items-center gap-1">
      {values.slice(0, 1).map((value) => {
        const source = sources?.find((source) => source === value);
        return source ? (
          <SourceBadge key={value} source={source} transparent />
        ) : null;
      })}
      {values.length > 1 && (
        <p className="ml-1 text-xs">+{values.length - 1}</p>
      )}
    </div>
  );
};

const ValueSource = ({ filter }: { filter: FilterSelect }) => {
  const { values } = filter;

  return <SourceBadge source={values[0] as Source} transparent />;
};

const ValueTag = ({ filter }: { filter: FilterSelect }) => {
  const { values } = filter;
  const { data: tags } = trpc.tags.list.useQuery();

  return (
    <div className="flex max-w-64 items-center gap-1">
      {values.slice(0, 2).map((value) => {
        const tag = tags?.find((tag) => tag.id === value);
        return tag ? <TagBadge key={value} tag={tag} /> : null;
      })}
      {values.length > 2 && (
        <p className="ml-1 text-xs">+{values.length - 2}</p>
      )}
    </div>
  );
};

const CountryGroup = ({
  filter,
}: {
  filter: FilterSelect;
}) => {
  const { values } = filter;
  const { onUpdateFilter } = useFilters();

  const { data, isLoading } = trpc.members.listCountries.useQuery();
  const formattedCountries = countries.all
    .filter((country) => data?.includes(country.alpha2))
    .map((country) => ({
      name: country.name,
      alpha2: country.alpha2,
    }));

  const onSelect = (country: string) => {
    const hasCountry = values.some((value) => value === country);

    const newFilter = FilterSelectSchema.parse({
      ...filter,
      values: hasCountry
        ? values.filter((value) => value !== country)
        : [...values, country],
    });

    onUpdateFilter(newFilter);
  };

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No countries found.</CommandEmpty>}
      <CommandGroup>
        {isLoading && <Skeleton className="h-8 w-full" />}
        {formattedCountries?.map((country) => (
          <CommandItem
            key={country.alpha2}
            value={country.name}
            onSelect={() => onSelect(country.alpha2)}
          >
            <Checkbox
              checked={values.includes(country.alpha2)}
              className="mr-2"
            />
            <CountryBadge country={country.alpha2} transparent />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};

const LanguageGroup = ({
  filter,
}: {
  filter: FilterSelect;
}) => {
  const { values } = filter;
  const { onUpdateFilter } = useFilters();

  const { data: languages, isLoading } = trpc.members.listLanguages.useQuery();

  const onSelect = (language: string) => {
    const hasLanguage = values.some((value) => value === language);

    const newFilter = FilterSelectSchema.parse({
      ...filter,
      values: hasLanguage
        ? values.filter((value) => value !== language)
        : [...values, language],
    });

    onUpdateFilter(newFilter);
  };

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No languages found.</CommandEmpty>}
      <CommandGroup>
        {isLoading && <Skeleton className="h-8 w-full" />}
        {languages?.map((language) => (
          <CommandItem
            key={language}
            value={language}
            onSelect={() => onSelect(language)}
          >
            <Checkbox checked={values.includes(language)} className="mr-2" />
            <LanguageBadge language={language} transparent />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};

const ProfilesGroup = ({
  filter,
}: {
  filter: FilterSelect;
}) => {
  const { onUpdateFilter } = useFilters();
  const { values } = filter;
  const { data: sources, isLoading } =
    trpc.members.listSourcesProfile.useQuery();

  const onSelect = (source: string) => {
    const hasSource = values.some((value) => value === source);

    const newFilter = FilterSelectSchema.parse({
      ...filter,
      values: hasSource
        ? values.filter((value) => value !== source)
        : [...values, source],
    });

    onUpdateFilter(newFilter);
  };
  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No sources found.</CommandEmpty>}
      <CommandGroup>
        {isLoading && <Skeleton className="h-8 w-full" />}
        {sources?.map((source) => (
          <CommandItem
            key={source}
            value={source}
            onSelect={() => onSelect(source)}
          >
            <Checkbox checked={values.includes(source)} className="mr-2" />
            <SourceBadge source={source} transparent />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};

const SourcesGroup = ({
  filter,
}: {
  filter: FilterSelect;
}) => {
  const { values } = filter;
  const { onUpdateFilter } = useFilters();
  const { data: sources, isLoading } =
    trpc.members.listSourcesMember.useQuery();

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No sources found.</CommandEmpty>}
      <CommandGroup>
        {sources?.map((source) => (
          <CommandItem
            key={source}
            value={source}
            onSelect={() => onUpdateFilter({ ...filter, values: [source] })}
          >
            <SourceBadge source={source} transparent />
            {values.includes(source) && <Check size={16} className="ml-auto" />}
          </CommandItem>
        ))}
        {isLoading && <Skeleton className="h-8 w-full" />}
      </CommandGroup>
    </CommandList>
  );
};

const TagsGroup = ({
  filter,
}: {
  filter: FilterSelect;
}) => {
  const { onUpdateFilter } = useFilters();
  const { values } = filter;
  const { data: tags, isLoading } = trpc.tags.list.useQuery();

  const onSelect = (tag: Tag) => {
    const hasTag = values.some((value) => value === tag.id);

    const newFilter = FilterSelectSchema.parse({
      ...filter,
      values: hasTag
        ? values.filter((value) => value !== tag.id)
        : [...values, tag.id],
    });

    onUpdateFilter(newFilter);
  };

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No tags found.</CommandEmpty>}
      <CommandGroup>
        {isLoading && <Skeleton className="h-8 w-full" />}
        {tags?.map((tag) => (
          <CommandItem
            key={tag.id}
            value={tag.name}
            onSelect={() => onSelect(tag)}
          >
            <Checkbox checked={values.includes(tag.id)} className="mr-2" />
            <TagBadge tag={tag} transparent />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};
