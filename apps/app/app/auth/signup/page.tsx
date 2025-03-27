import { SignupForm } from "@/features/auth/signup-form";

type Props = {
  searchParams: {
    plan?: string;
    priceId?: string;
  };
};

export default async function Page({ searchParams }: Props) {
  const { plan, priceId } = await searchParams;

  return <SignupForm plan={plan} priceId={priceId} />;
}
