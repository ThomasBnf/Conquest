import { Company } from "@/components/Company";
import { HeroSection } from "@/components/HeroSection";
import { MainLayout } from "@/components/MainLayout";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { Integrations } from "@/components/Integrations";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <Problem />
      <Solution />
      <Integrations />
      <Company />
    </MainLayout>
  );
}
