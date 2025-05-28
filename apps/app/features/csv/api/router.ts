import { router } from "@/server/trpc";
import { importCSV } from "./importCSV";

export const CSVRouter = router({
  import: importCSV,
});
