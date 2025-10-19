import BgGradient from "@/components/common/bg-gradient";
import Hero from "@/components/home/hero";
import Demo from "@/components/home/demo";
import WorkingGuide from "@/components/home/working-guide";


export default function Home() {
  return (
    <div className="relative w-full">
      <BgGradient />

      <div className="flex flex-col">
        <Hero />
        <Demo />
      </div>

      <WorkingGuide />
    </div>
  );
}
