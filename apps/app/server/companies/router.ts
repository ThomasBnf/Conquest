import { router } from "../trpc";
import { countCompanies } from "./countCompanies";
import { createCompany } from "./createCompany";
import { deleteManyCompanies } from "./deleteManyCompanies";
import { exportCompanies } from "./exportCompanies";
import { getAllCompanies } from "./getAllCompanies";
import { getCompany } from "./getCompany";
import { listCompanies } from "./listCompanies";
import { listCompanyMembers } from "./listCompanyMembers";
import { updateCompany } from "./updateCompany";
import { updateManyCompanies } from "./updateManyCompanies";

export const companiesRouter = router({
  getAllCompanies,
  get: getCompany,
  listCompanyMembers,
  list: listCompanies,
  post: createCompany,
  updateCompany,
  updateManyCompanies,
  deleteManyCompanies,
  countCompanies,
  exportCompanies,
});
