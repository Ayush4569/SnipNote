import BgGradient from "@/components/common/bg-gradient";
import UploadForm from "@/components/upload/form";
import UploadHeader from "@/components/upload/hero";

export default function UploadPage() {
    return (
      <section className="min-h-screen">
        <BgGradient />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="flex flex-col items-center gap-6 justify-center text-center">
          <UploadHeader/>
          <UploadForm/>
          </div>
        </div>
      </section>
    );
  }
  