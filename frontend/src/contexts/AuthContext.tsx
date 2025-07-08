import type { components } from "../types/api";

type User = components["schemas"]["UserSerializer"];

export type AuthContextType = {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

import { createContext } from "react";
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
