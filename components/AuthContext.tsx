"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
}

interface AuthContextType {
  user: User | null;
  isDemo: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  enterDemoMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUser: User = {
  id: "demo-user",
  name: "Marina Valentine",
  email: "marina@demo.com",
  avatar: "/images/avatars/avatar_01.png",
  level: 24,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const isAuthenticated = user !== null || isDemo;

  const loginWithGoogle = async () => {
    // TODO: Implement NextAuth Google login
    // For now, mock login
    setUser({
      id: "google-user-1",
      name: "New User",
      email: "user@gmail.com",
      avatar: "/images/avatars/avatar_01.png",
      level: 1,
    });
    setIsDemo(false);
  };

  const enterDemoMode = () => {
    setUser(demoUser);
    setIsDemo(true);
  };

  const logout = () => {
    setUser(null);
    setIsDemo(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isDemo,
        isAuthenticated,
        loginWithGoogle,
        enterDemoMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
