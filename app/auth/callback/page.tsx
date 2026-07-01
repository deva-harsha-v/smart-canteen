"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageSpinner } from "@/components/ui";

// Forces this page to render only on the client — it depends on the
// OAuth redirect hash/query which doesn't exist at build time.
export const dynamic = "force-dynamic";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    const handleUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? null,
        role: role ?? "student",
      });

      router.push(role === "owner" ? "/owner/dashboard" : "/student/stalls");
    };
    handleUser();
  }, [role, router]);

  return <PageSpinner label="Signing you in…" />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
