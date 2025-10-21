"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BgGradient from "../common/bg-gradient";
import { Loader2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  useEffect(() => {
    const interval = setTimeout(() => router.replace('/'), 3000);
    return () => clearTimeout(interval);
  }, [router])
  
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
      <BgGradient />
      <div className="md:bg-white md:shadow-lg shadow-none md:rounded-2xl rounded-none md:p-10 p-6 max-w-md w-full text-center transition-all duration-300">
        <div className="flex justify-center mb-6">
          <Image 
          priority 
          src="/authSuccess.svg" 
          alt="Success illustration" 
          width={200} 
          height={200}
          style={{ width: 200, height: 200 }}
           />
        </div>
        <h1 className="text-3xl font-semibold text-green-600 mb-2">Login Successful</h1>
        <p className="text-gray-700 mb-6">
          Welcome back! You are being redirected to the dashboard...
        </p>

        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
        </div>
      </div>
    </main>
  );
}
