import { IsLoading } from "@/components/states/is-loading";
import { LoginForm } from "@/features/auth/login-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<IsLoading />}>
      <LoginForm />
    </Suspense>
  );
}
