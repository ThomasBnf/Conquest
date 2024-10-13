import { ContactsTable } from "features/contacts/table/contacts-table";
import { searchParamsContacts } from "lib/searchParamsContacts";
import { countContacts } from "queries/contacts/countContacts";
import { listTags } from "queries/tags/listTags";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  searchParamsContacts.parse(searchParams);

  const rTags = await listTags();
  const tags = rTags?.data;

  const rCountContacts = await countContacts();
  const count = rCountContacts?.data ?? 0;

  return <ContactsTable tags={tags} contactsCount={count} />;
}
