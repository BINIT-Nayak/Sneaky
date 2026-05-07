import { createContext } from "react";

export interface UserType {
  userId: string;
  name?: string;
  email: string;
  isGuest?: boolean;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUserUpdate: (user: UserType) => void;
  user: UserType | null;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  onOpenAuth: () => {},
  onLogout: () => {},
  onUserUpdate: () => {},
  user: null,
});
