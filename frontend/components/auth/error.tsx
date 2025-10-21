"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import BgGradient from "../common/bg-gradient";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get("message") || "Something went wrong during login.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <BgGradient/>
      <div className="md:bg-white md:shadow-lg shadow-none md:rounded-2xl rounded-none md:p-10 p-6 max-w-md w-full text-center transition-all duration-300">
        <div className="flex justify-center mb-6">
          <Image 
          priority src="/auth-error.webp" 
          alt="Error illustration" 
          width={200} 
          height={200}
          style={{ width: 200, height: 200 }}
           />
        </div>
        <h1 className="text-3xl font-semibold text-red-600 mb-2">Authentication Error</h1>
        <p className="text-gray-700 mb-6">{errorMessage}</p>

        <Button
          onClick={() => router.push("/auth/login")}
         
        >
          Try Signing In Again
        </Button>

        <div className="mt-6 text-sm text-gray-500">
          Having trouble? Contact{" "}
          <a href="mailto:support@docmind.ai" className="underline hover:text-gray-700">
            support
          </a>
          .
        </div>
      </div>
    </main>
  );
}
