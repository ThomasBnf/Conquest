import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { MenuList } from "@/features/lists/menu-list";
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
        <MenuList listId={listId} />
      </Header>
      <Table initialFilters={list.filters} />
    </PageLayout>
  );
}
