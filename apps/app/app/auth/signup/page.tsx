import { SignupForm } from "@/features/auth/signup-form";

type Props = {
  params: Promise<{
    plan?: string;
    priceId?: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { plan, priceId } = await params;

  return <SignupForm plan={plan} priceId={priceId} />;
}
