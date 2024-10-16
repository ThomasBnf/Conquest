import { ContactMenu } from "@/features/contacts/contact-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { GroupedActivities } from "features/activities/grouped-activities";
import { ContactSidebar } from "features/contacts/contact-sidebar";
import { redirect } from "next/navigation";
import { listActivities } from "queries/activities/listActivities";
import { getContact } from "queries/contacts/getContact";
import { listTags } from "queries/tags/listTags";

type Props = {
  params: {
    slug: string;
    contactId: string;
  };
};

export default async function Page({ params: { contactId, slug } }: Props) {
  const rActivities = await listActivities({ contact_id: contactId });
  const activities = rActivities?.data;

  const rContact = await getContact({ id: contactId });
  const contact = rContact?.data;

  const rTags = await listTags();
  const tags = rTags?.data;

  if (!contact) redirect(`/w/${slug}/contacts`);

  const { full_name } = contact;

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 items-center justify-between px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/w/${slug}/contacts`}>
                Contacts
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{full_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ContactMenu contact={contact} />
      </div>
      <div className="flex min-h-0 flex-1 divide-x">
        <ScrollArea className="flex-1">
          <GroupedActivities
            activities={activities}
            className="mx-auto max-w-3xl px-4 md:px-8"
          />
        </ScrollArea>
        <ContactSidebar contact={contact} tags={tags} />
      </div>
    </div>
  );
}
