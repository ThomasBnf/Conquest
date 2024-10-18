import { Loader } from "@conquest/ui/loader";

export const IsLoading = () => {
  return (
    <div className="flex h-full items-center justify-center py-40">
      <Loader />
    </div>
  );
};
