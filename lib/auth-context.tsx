"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Role } from "./types";

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", currentUser.id)
      .single();
    setRole((data?.role as Role) ?? null);
  }, []);

  const refresh = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);
    await loadProfile(currentUser);
  }, [loadProfile]);

  useEffect(() => {
    let mounted = true;

    // Don't call supabase.auth.getSession() here as well — onAuthStateChange
    // below already fires once immediately with the current session (event
    // "INITIAL_SESSION"). Calling both races two lock-holding requests
    // against each other under React Strict Mode's double-invoked effects,
    // which throws "AbortError: Lock broken by another request with the
    // 'steal' option" and crashes the page in dev.
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        await loadProfile(session?.user ?? null);
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
