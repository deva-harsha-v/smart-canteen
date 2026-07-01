"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, GraduationCap, Store, Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/lib/toast";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Route based on the role actually stored for this account, not a
    // client-side guess — avoids sending a student into the owner console.
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profile?.role && profile.role !== role) {
      toast.error(
        `This account is registered as a ${profile.role}, not ${
          role === "owner" ? "an owner" : "a student"
        }. Switch the tab above and try again.`
      );
      return;
    }

    toast.success("Welcome back!");

    if (profile?.role === "owner") {
      router.push("/owner/dashboard");
    } else {
      router.push("/student/stalls");
    }
  };

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center px-6 py-16 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative bg-surface/60 backdrop-blur-xl border border-ink/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-up">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="text-ink/40 mt-2 text-sm">
            Sign in as a <span className="text-primary capitalize">{role === "owner" ? "stall owner" : "student"}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 bg-black/[0.04] rounded-2xl p-1.5 border border-ink/5">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              role === "student"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-ink/40 hover:text-ink/70"
            }`}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole("owner")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              role === "owner"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-ink/40 hover:text-ink/70"
            }`}
          >
            <Store size={16} /> Stall owner
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/40 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/25"
              />
              <Input
                type="email"
                placeholder="name@example.com"
                className="pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/40 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/25"
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-11 pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/25 hover:text-ink/60 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full !mt-7"
            size="lg"
          >
            {!loading && (
              <>
                Sign in <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-ink/40 mt-7">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
