import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateTaskDialog } from "@/features/tasks/create-task-dialog";
import { TasksListPage } from "@/features/tasks/tasks-list-page";

export default function Page() {
  return (
    <PageLayout>
      <Header title="Tasks">
        <CreateTaskDialog />
      </Header>
      <TasksListPage />
    </PageLayout>
  );
}
