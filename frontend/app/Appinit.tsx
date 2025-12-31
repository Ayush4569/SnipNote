'use client';
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth.context";

export default function AppInit() {
  const { login, logout, setLoading, setStatus } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      setLoading();

      try {
        const {data} = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
          { withCredentials: true }
        );

        login(data.user);
        setStatus("authenticated");
      } catch (err) {
        logout();
      }
    };

    initAuth();
  }, []);

  return null;
}
