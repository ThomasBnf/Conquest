import { router } from "@/server/trpc";
import { countMembers } from "./countMembers";
import { createMember } from "./createMember";
import { deleteManyMembers } from "./deleteManyMembers";
import { deleteMember } from "./deleteMember";
import { exportMembers } from "./exportMembers";
import { getAllCountries } from "./getAllCountries";
import { getAllLanguages } from "./getAllLanguages";
import { getAllMembers } from "./getAllMembers";
import { getMember } from "./getMember";
import { listMembers } from "./listMembers";
import { mergeMembers } from "./mergeMembers";
import { updateManyMembers } from "./updateManyMembers.";
import { updateMember } from "./updateMember";

export const membersRouter = router({
  listMembers,
  getAllMembers,
  countMembers,
  getMember,
  createMember,
  updateMember,
  updateManyMembers,
  deleteManyMembers,
  deleteMember,
  mergeMembers,
  exportMembers,
  getAllLanguages,
  getAllCountries,
});
