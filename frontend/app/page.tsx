import BgGradient from "@/components/common/bg-gradient";
import Hero from "@/components/home/hero";
import Demo from "@/components/home/demo";
import WorkingGuide from "@/components/home/working-guide";
import Pricing from "@/components/home/pricing";
import CTA from "@/components/home/cta";


export default function Home() {

  return (
    <div className="relative w-full">
      <BgGradient />

      <div className="flex flex-col">
        <Hero />
        <Demo />
        <WorkingGuide />
        <Pricing />
        <CTA />
      </div>

    </div>
  );
}
