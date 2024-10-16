import { prisma } from "@/lib/prisma";

type Props = {
  slack_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  job_title: string;
};

export const updateContact = async ({
  slack_id,
  first_name,
  last_name,
  phone: newPhone,
  avatar_url,
  job_title,
}: Props) => {
  const currentContact = await prisma.contact.findUnique({
    where: {
      slack_id,
    },
  });

  const { emails, phone } = currentContact;
  const newSearch = `${first_name} ${last_name} ${emails} ${newPhone ?? phone}`;

  return await prisma.contact.update({
    where: {
      slack_id,
    },
    data: {
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`,
      phone: newPhone ?? phone,
      avatar_url,
      job_title,
      search: newSearch,
    },
  });
};
