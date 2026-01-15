"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { DataProvider } from "@/components/DataContext";

// Lazy load components for better code splitting
const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  ssr: false,
});
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const SidebarLeft = dynamic(() => import("@/components/SidebarLeft"), {
  ssr: false,
});
const SidebarRight = dynamic(() => import("@/components/SidebarRight"), {
  ssr: false,
});
const SidebarContext = dynamic(
  () =>
    import("@/components/SidebarContext").then((mod) => ({
      default: mod.SidebarProvider,
    })),
  { ssr: false }
);

function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <SidebarContext>
      <DataProvider>
        <Navbar />
        <SidebarLeft />
        <SidebarRight />
        <main className="pt-20 min-h-screen">
          <div className="content-grid w-full max-w-[1184px] mx-auto px-4 lg:px-6 xl:px-8 py-8">
            {children}
          </div>
        </main>
        <div className="floaty-bar flex items-center justify-around px-4">
          <div className="text-primary">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div className="text-secondary">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary -mt-6 bg-surface p-1">
            <img
              src="/images/avatars/avatar_01.png"
              alt="User"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="text-accent-blue">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="text-accent-orange">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
      </DataProvider>
    </SidebarContext>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
