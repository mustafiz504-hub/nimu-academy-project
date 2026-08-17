export interface User {
  id: string;          // server returns 'id' (PostgreSQL)
  name: string;
  email: string;
  phone?: string;
  phone_number?: string;   // E.164 format e.g. "+919876543210"
  country_code?: string;   // e.g. "+91"
  role: "user" | "admin" | "superadmin";
  avatar?: string;
  is_verified?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  marketing_opt_in?: boolean;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
