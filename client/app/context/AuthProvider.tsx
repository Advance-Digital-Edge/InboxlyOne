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

type AuthContextType = {
  user: any;
  setUser: (user: any) => void;
  loading: boolean;
  loadingIntegrations: boolean;
  userIntegrations: any | null;
  fetchUserIntegrations?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userIntegrations, setUserIntegrations] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Function to fetch user integrations
  const fetchUserIntegrations = async () => {
    try {
      const res: any = await getUserIntegrations();
      console.log(
        res
          ? "User integrations fetched successfully"
          : "No user integrations found"
      );
      setUserIntegrations(res);
      setLoadingIntegrations(false);
    } catch (error) {
      console.error("Failed to fetch user integrations:", error);
      setUserIntegrations(null); // Reset or handle the state gracefully
      setLoadingIntegrations(false);
    }
  };

  // Fetch user integrations when the user state changes
  useEffect(() => {
    fetchUserIntegrations();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        userIntegrations,
        fetchUserIntegrations,
        loadingIntegrations,
      }}
    >
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
