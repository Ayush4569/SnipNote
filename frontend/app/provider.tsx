"use client";
import { AuthContextProvider } from "@/context/auth.context";
import {Toaster} from "sonner"
import AppInit from "./Appinit";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/tanstack";
export default function Providers({
  children,
  tokenStatus
}: {
  children: React.ReactNode;
  tokenStatus: { hasAccessToken: boolean; hasRefreshToken: boolean };
}) {
  
  return (
     <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-center"/>
      <AppInit 
      hasAccessToken={tokenStatus.hasAccessToken} 
      hasRefreshToken={tokenStatus.hasRefreshToken}
      />
      {children}
      </QueryClientProvider>
     </AuthContextProvider>
  );
}