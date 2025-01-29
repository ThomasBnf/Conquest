import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { ListMenu } from "@/features/lists/list-menu";
import { Table } from "@/features/members/table";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { getList } from "@conquest/db/queries/lists/getList";

type Props = {
  params: {
    listId: string;
  };
};

export default async function Page({ params: { listId } }: Props) {
  const user = await getCurrentUser();
  const { workspace_id } = user;

  const list = await getList({ workspace_id, list_id: listId });

  return (
    <PageLayout>
      <Header title={list.name}>
        <ListMenu listId={listId} />
      </Header>
      <Table initialFilters={list.filters} />
    </PageLayout>
  );
}
