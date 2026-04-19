"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "./AuthContext";
import SettingsDropdown from "./SettingsDropdown";
import MessagesDropdown from "./MessagesDropdown";
import CartDropdown from "./CartDropdown";
import FriendsDropdown from "./FriendsDropdown";
import NotificationsDropdown from "./NotificationsDropdown";
import { LocaleSwitcher } from "./LocaleSwitcher";

const Navbar = memo(function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("navbar");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Calculate XP progress (example: 1000 XP per level)
  const xpPerLevel = 1000;
  const currentXp = user?.experiencePoints || 0;
  const xpInCurrentLevel = currentXp % xpPerLevel;
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;
  const xpProgress = Math.round((xpInCurrentLevel / xpPerLevel) * 100);

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-surface z-50 flex items-center justify-between px-6 shadow-[0_0_40px_0_rgba(0,0,0,0.3)]">
      {/* Colorful gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-secondary to-accent-blue" />
      <div className="flex items-center gap-4 md:gap-8">
        <div
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-background rounded-lg cursor-pointer text-text-muted hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        </div>

        <Link href="/" className="group hidden sm:block">
          <span className="font-black text-2xl tracking-tighter text-white group-hover:text-primary transition-colors duration-300">
            CLODDY
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-xl px-4 md:px-12">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="w-full bg-background border-none rounded-xl py-3 px-6 text-sm text-white placeholder-text-muted focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary hover:text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
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
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex flex-col gap-1 w-32 xl:w-48">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span className="text-text-muted">Next: {xpToNextLevel} EXP</span>
            <span className="text-white">{xpProgress}%</span>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary to-accent-blue transition-all duration-1000"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <CartDropdown />
          <FriendsDropdown />

          <MessagesDropdown />

          <NotificationsDropdown />

          <div className="hidden md:block w-px h-8 bg-border mx-2"></div>

          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>

          <div className="hidden md:block">
            <SettingsDropdown />
          </div>

          <Link href="/profile" className="relative hidden sm:block group">
            <div className="w-12 h-12 hexagon-mask overflow-hidden cursor-pointer group-hover:scale-110 transition-transform relative">
              <Image
                src={user?.avatar || "/images/avatars/avatar_01.png"}
                alt={user?.name || "User"}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized={user?.avatar?.includes("dicebear")}
              />
            </div>
            <div className="absolute inset-0 hexagon-mask border-2 border-primary pointer-events-none"></div>
          </Link>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
