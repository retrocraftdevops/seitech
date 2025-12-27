import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesOverview } from '@/components/sections/ServicesOverview';
import { TrainingMethods } from '@/components/sections/TrainingMethods';
import { UpcomingScheduleSection } from '@/components/sections/UpcomingScheduleSection';
import { AccreditationsSection } from '@/components/sections/AccreditationsSection';
import { CTASection } from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesOverview />
        <TrainingMethods />
        <UpcomingScheduleSection />
        <AccreditationsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
