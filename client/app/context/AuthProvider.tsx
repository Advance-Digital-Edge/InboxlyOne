"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  use,
} from "react";
import { getUser, getUserIntegrations } from "../actions";
import { get } from "http";

type AuthContextType = {
  user: any;
  setUser: (user: any) => void;
  loading: boolean;
  userIntegrations: Integrations | null;
};

type Integrations = {
  id: string;
  slack_connected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userIntegrations, setUserIntegrations] = useState<Integrations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
        setLoading(false);
      }else{
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserIntegrations = async () => {
      if (!user) return;

      try {
        const res = await getUserIntegrations();
        setUserIntegrations(res);
        console.log("User Integrations:", res);
      } catch (error) {
        console.error("Failed to fetch user integrations:", error);
        setUserIntegrations(null); // Reset or handle the state gracefully
      }
    };

    fetchUserIntegrations();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, userIntegrations }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
