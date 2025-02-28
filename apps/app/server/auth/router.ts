import { createCallerFactory, router } from "@/server/trpc";
import { login } from "./login";
import { signout } from "./signout";
import { signup } from "./signup";

export const authRouter = router({
  login,
  signup,
  signout,
});

const createCaller = createCallerFactory(authRouter);

export const caller = createCaller({ session: null });
