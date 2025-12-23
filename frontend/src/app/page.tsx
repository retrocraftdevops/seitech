import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesOverview } from '@/components/sections/ServicesOverview';
import { TrainingMethods } from '@/components/sections/TrainingMethods';
import { UpcomingScheduleSection } from '@/components/sections/UpcomingScheduleSection';
import { AccreditationsSection } from '@/components/sections/AccreditationsSection';
import { CTASection } from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesOverview />
      <TrainingMethods />
      <UpcomingScheduleSection />
      <AccreditationsSection />
      <CTASection />
    </>
  );
}
