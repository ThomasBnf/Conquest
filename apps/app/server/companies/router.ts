import { router } from "../trpc";
import { countCompanies } from "./countCompanies";
import { createCompany } from "./createCompany";
import { deleteManyCompanies } from "./deleteManyCompanies";
import { exportCompanies } from "./exportCompanies";
import { getAllCompanies } from "./getAllCompanies";
import { getCompany } from "./getCompany";
import { getCompanyMembers } from "./getCompanyMembers";
import { listCompanies } from "./listCompanies";
import { updateCompany } from "./updateCompany";
import { updateManyCompanies } from "./updateManyCompanies";

export const companiesRouter = router({
  getAllCompanies,
  getCompany,
  getCompanyMembers,
  listCompanies,
  createCompany,
  updateCompany,
  updateManyCompanies,
  deleteManyCompanies,
  countCompanies,
  exportCompanies,
});
