"use client";

import type { UserRole } from "@/types/user";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AuthUser {
  id: number;
  username: string;
  avatar_url: string;
  role: UserRole;
  is_banned: boolean;
  slug: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();

      setUser(json.success && json.data ? json.data : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
