import { createContext } from "react";

export interface UserType {
  name?: string;
  email: string;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  user: UserType | null;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  onOpenAuth: () => {},
  onLogout: () => {},
  user: null,
});
