'use client';
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth.context";
import { setupAxios } from "@/lib/setupAxios";

export default function AppInit() {
  const { login, logout, setLoading, setStatus } = useAuth();

  useEffect(() => {
    setupAxios();
    const initAuth = async () => {
      setLoading();

      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
          { withCredentials: true }
        );

        if (data.success && data.user) {
          login(data.user);
          setStatus("authenticated");
        } else {
          logout();
        }
      } catch (err) {
        logout();
      }
    };

    initAuth();
  }, []);

  return null;
}
