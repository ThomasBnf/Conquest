import { router } from "@/server/trpc";
import { countMembers } from "./countMembers";
import { createMember } from "./createMember";
import { deleteManyMembers } from "./deleteManyMembers";
import { deleteMember } from "./deleteMember";
import { exportMembers } from "./exportMembers";
import { getAllMembers } from "./getAllMembers";
import { getMember } from "./getMember";
import { listCountries } from "./listCountries";
import { listLanguages } from "./listLanguages";
import { listMembers } from "./listMembers";
import { listSourcesProfile } from "./listSourceProfile";
import { listSourcesMember } from "./listSourcesMember";
import { mergeMembers } from "./mergeMembers";
import { updateManyMembers } from "./updateManyMembers";
import { updateMember } from "./updateMember";

export const membersRouter = router({
  list: listMembers,
  getAllMembers,
  count: countMembers,
  get: getMember,
  post: createMember,
  update: updateMember,
  updateManyMembers,
  deleteManyMembers,
  delete: deleteMember,
  export: exportMembers,
  merge: mergeMembers,
  listLanguages,
  listCountries,
  listSourcesMember,
  listSourcesProfile,
});
