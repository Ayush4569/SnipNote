'use client';
import BgGradient from "@/components/common/bg-gradient";
import { MotionDiv } from "@/components/common/motion-helpers";
import UploadForm from "@/components/upload/form";
import UploadHeader from "@/components/upload/hero";
import { useAuth } from "@/context/auth.context";
import { containerVariants } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function UploadComponent() {
  const {status} = useAuth();
  const router = useRouter()
  if(status === 'unauthenticated') {
    router.push('/auth/login')
    return null;
  }
    return (
      <section className="min-h-screen">
        <BgGradient />
        <MotionDiv 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="flex flex-col items-center gap-6 justify-center text-center">
          <UploadHeader/>
          <UploadForm/>
          </div>
        </MotionDiv>
      </section>
    );
  }
  