"use client";

import Link from "next/link";
import { useSidebar } from "./SidebarContext";
import SettingsDropdown from "./SettingsDropdown";
import MessagesDropdown from "./MessagesDropdown";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-surface z-50 flex items-center justify-between px-6 border-b border-border/50 shadow-[0_0_40px_0_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-4 md:gap-8">
        <div
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-background rounded-lg cursor-pointer text-text-muted hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        </div>

        <div className="text-primary font-black text-2xl tracking-tighter hidden sm:block">
          CLODDY
        </div>

        <div className="hidden xl:flex items-center gap-6 text-xs font-bold text-text-muted uppercase tracking-wider">
          <Link
            href="/"
            className="text-white hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Careers
          </Link>
          <Link href="/forums" className="hover:text-primary transition-colors">
            Forums
          </Link>
          <Link href="/events" className="hover:text-primary transition-colors">
            Events
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-4 md:px-12">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search here for people or groups"
            className="w-full bg-background border-none rounded-xl py-3 px-6 text-sm text-white placeholder-text-muted focus:ring-1 focus:ring-primary outline-none"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex flex-col gap-1 w-32 xl:w-48">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span className="text-text-muted">Next: 380 EXP</span>
            <span className="text-white">62%</span>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-primary to-accent-blue w-[62%] transition-all duration-1000"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-primary hover:text-white transition-all border border-border">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>

          <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-primary hover:text-white transition-all border border-border">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </div>

          <MessagesDropdown />

          <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-secondary hover:text-white transition-all border border-border relative">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-surface"></div>
          </div>

          <div className="hidden md:block w-px h-8 bg-border mx-2"></div>

          <div className="hidden md:block">
            <SettingsDropdown />
          </div>

          <Link href="/profile" className="relative hidden sm:block group">
            <div className="w-12 h-12 hexagon-mask overflow-hidden cursor-pointer group-hover:scale-110 transition-transform">
              <img
                src="/images/avatars/avatar_01.png"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 hexagon-mask border-2 border-primary pointer-events-none"></div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
