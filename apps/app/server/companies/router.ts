import { router } from "../trpc";
import { countCompanies } from "./countCompanies";
import { createCompany } from "./createCompany";
import { deleteManyCompanies } from "./deleteManyCompanies";
import { exportCompanies } from "./exportCompanies";
import { getAllCompanies } from "./getAllCompanies";
import { getCompany } from "./getCompany";
import { listCompanyMembers } from "./listCompanyMembers";
import { listFilteredCompanies } from "./listFilteredCompanies";
import { listInfiniteCompanies } from "./listInfiniteCompanies";
import { updateCompany } from "./updateCompany";
import { updateManyCompanies } from "./updateManyCompanies";

export const companiesRouter = router({
  getAllCompanies,
  get: getCompany,
  listCompanyMembers,
  list: listFilteredCompanies,
  listInfinite: listInfiniteCompanies,
  post: createCompany,
  update: updateCompany,
  updateManyCompanies,
  deleteManyCompanies,
  count: countCompanies,
  export: exportCompanies,
});
