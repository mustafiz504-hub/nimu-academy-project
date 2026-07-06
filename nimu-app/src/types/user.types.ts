export interface User {
  id: string;          // server returns 'id' (PostgreSQL)
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "superadmin";
  avatar?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
