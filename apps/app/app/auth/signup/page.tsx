import { IsLoading } from "@/components/states/is-loading";
import { SignupForm } from "@/features/auth/components/signup-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<IsLoading />}>
      <SignupForm />
    </Suspense>
  );
}
