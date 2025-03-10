import { PageList } from "@/features/lists/page-list";

type Props = {
  params: Promise<{
    listId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { listId } = await params;

  return <PageList listId={listId} />;
}
