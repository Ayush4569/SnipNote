"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import BgGradient from "../common/bg-gradient";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const MAX_TRY = 5;

export default function Login() {

  const { status } = useAuth();
  const router = useRouter();
  const [isBackendReady, setIsBackendReady] = useState(false);


  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    let attempts = 0;

    const awakeServer = async () => {
      try {
        await axios.get(process.env.NEXT_PUBLIC_HEALTH_URL!, {
          timeout: 4000,
        });
        setIsBackendReady(true);
      } catch {
        attempts++;
        if (attempts < MAX_TRY) {
          setTimeout(awakeServer, 3000);
        }
      }
    };

    awakeServer();
  }, []);


  const handleGoogleLogin = () => {
    if (!isBackendReady) {
      toast.error("Backend is not ready yet. Please wait a moment.");
      return;
    }

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

  if (status === "authenticated") {
    return null;
  }

  return (
    <section className="flex h-full w-full min-h-screen flex-col-reverse md:flex-row items-center justify-center gap-y-14 md:gap-y-0">
      <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />

      <div className="md:flex md:w-1/2 h-full flex-col justify-center items-center text-center px-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Snipnote
        </h1>
        <p className="text-gray-600 text-lg max-w-sm">
          Summarize, explore, and understand PDFs smarter and faster with AI-powered insights.
        </p>
        <Image src="/robot.png" alt="AI Illustration" width={350} height={350} className="mt-10" />
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-center">
        <div className="bg-white shadow-lg rounded-2xl p-10 mx-6 sm:w-[90%] md:w-[70%] lg:w-[60%]">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Sign in to continue
            </h2>

            <Button
              disabled={!isBackendReady}
              onClick={handleGoogleLogin}
              className={`flex items-center gap-3 bg-gray-900 text-white px-6 py-6 rounded-lg ${!isBackendReady ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <Image src="/google.png" alt="Google logo" width={30} height={30} />
              <span>Sign in with Google</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
