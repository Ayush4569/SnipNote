"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BgGradient from "../common/bg-gradient";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/auth.context";
import { setupAxios } from "@/lib/setupAxios";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    setupAxios();
    const checkAuth = async () => {
      try {
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refreshToken");

        if (token) {
          try {
            localStorage.setItem("accessToken", token);
          } catch {}
        }
        if (refreshToken) {
          try {
            localStorage.setItem("refreshToken", refreshToken);
          } catch {}
        }

        const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers["Authorization"] = `Bearer ${storedToken}`;
        }
        const storedRefreshToken = refreshToken || (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null);
        if (storedRefreshToken) {
          headers["x-refresh-token"] = storedRefreshToken;
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
          {
            headers,
            withCredentials: true,
          }
        );

        if (data.success && data.user) {
          login({ ...data.user });
          router.replace("/dashboard");
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        router.replace("/auth/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, searchParams, login]);

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

        <h1 className="text-3xl font-semibold text-green-600 mb-2">
          Login Successful
        </h1>

        <p className="text-gray-700 mb-6">
          {checkingAuth
            ? "Verifying your session..."
            : "Redirecting you to the dashboard..."}
        </p>

        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
        </div>
      </div>
    </main>
  );
}
