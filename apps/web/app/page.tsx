import { HeroSection } from "@/components/v1/HeroSection";
import { MainLayout } from "@/components/MainLayout";
import { Benefits } from "@/components/v1/Benefits";
import { CTA } from "@/components/v1/CTA";
import { HowItWorks } from "@/components/v1/HowItWorks";
import { Problem } from "@/components/v1/Problem";
import { UseCases } from "@/components/v1/UseCases";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <Problem />
      <Benefits />
      <HowItWorks />
      <UseCases />
      <CTA />
    </MainLayout>
  );
}
