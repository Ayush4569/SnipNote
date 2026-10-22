import AuthSuccess from "@/components/auth/success";
import { Suspense } from "react";

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={null}>
      <AuthSuccess />
    </Suspense>
  );
}

