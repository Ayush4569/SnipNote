"use client";
import Image from "next/image";
import { Button } from "../ui/button";
import BgGradient from "../common/bg-gradient";

export default function Login() {
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL!}/auth/google/callback`;
  
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `access_type=offline&` +
      `prompt=consent`;
  
    window.location.href = googleAuthUrl;
  };
  
  return (
    <section className="flex min-h-screen flex-col md:flex-row items-center justify-center ">
        <BgGradient className="from-rose-400 via-rose-300 to-orange-200"/>
      
      <div className="hidden md:flex w-1/2 h-full flex-col justify-center items-center text-center px-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Snipnote</h1>
        <p className="text-gray-600 text-lg max-w-sm">
          Summarize, explore, and understand PDFs smarter and faster with AI-powered insights.
        </p>
        <Image
          src="/robot.png"
          alt="AI Illustration"
          width={350}
          height={350}
          className="mt-10"
        />
      </div>

      {/* Right section - Login card */}
      <div className="flex  w-full md:w-1/2 h-screen md:h-auto justify-center items-center">
        <div className="bg-white border border-rose-500 md:border-none shadow-lg rounded-2xl p-10 mx-6 sm:w-[90%] md:w-[70%] lg:w-[60%]">
          <div className="flex  flex-col items-center gap-6">
            <h2 className="text-2xl font-semibold text-gray-800">Sign in to continue</h2>

            <Button
              onClick={handleGoogleLogin}
              className="max-w-5xl flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-6 rounded-lg shadow-md transition-all"
            >
              <Image
                src="/google.png"
                alt="Google logo"
                width={30}
                height={30}
              />
              <span className="text-base">Sign in with Google</span>
            </Button>

            <p className="text-sm text-gray-500 text-center mt-4">
              By signing in, you agree to our{" "}
              <a href="/terms" className="underline hover:text-gray-700">
                Terms
              </a>{" "}
              &{" "}
              <a href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
