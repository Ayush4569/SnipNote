"use client";
import { AuthContextProvider } from "@/context/auth.context";
import {Toaster} from "sonner"
export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
     <AuthContextProvider>
      <Toaster position="bottom-center"/>
      {children}
     </AuthContextProvider>
  );
}