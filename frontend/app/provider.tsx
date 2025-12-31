"use client";
import { AuthContextProvider } from "@/context/auth.context";
import {Toaster} from "sonner"
import AppInit from "./Appinit";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/tanstack";
export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
     <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-center"/>
      <AppInit />
      {children}
      </QueryClientProvider>
     </AuthContextProvider>
  );
}