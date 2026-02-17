export type UserRole = "buyer" | "creator" | "admin";

export interface User {
  id: number;
  steam_id: string;
  username: string;
  avatar_url: string;
  role: UserRole;
  is_banned: boolean;
  bio: string | null;
  banner_url: string | null;
  slug: string | null;
  social_links: Record<string, string> | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
}
