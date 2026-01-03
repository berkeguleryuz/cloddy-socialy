"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import HexagonAvatar from "./HexagonAvatar";

interface MenuSection {
  title: string;
  items: {
    label: string;
    href: string;
    badge?: string;
  }[];
}

const menuSections: MenuSection[] = [
  {
    title: "MY PROFILE",
    items: [
      { label: "Profile Info", href: "/settings/profile" },
      { label: "Social & Stream", href: "/settings/social" },
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Messages", href: "/settings/messages" },
      { label: "Friend Requests", href: "/settings/friend-requests" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { label: "Account Info", href: "/settings/account" },
      { label: "Change Password", href: "/settings/password" },
      { label: "General Settings", href: "/settings/general" },
    ],
  },
  {
    title: "GROUPS",
    items: [
      { label: "Manage Groups", href: "/settings/groups" },
      { label: "Invitations", href: "/settings/invitations" },
    ],
  },
  {
    title: "MY STORE",
    items: [
      { label: "My Account", href: "/settings/store", badge: "$250,32" },
      { label: "Sales Statement", href: "/settings/sales" },
      { label: "Manage Items", href: "/settings/items" },
      { label: "Downloads", href: "/settings/downloads" },
    ],
  },
];

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 hexagon-mask bg-surface flex items-center justify-center cursor-pointer transition-all ${
          isOpen ? "text-primary" : "text-text-muted hover:text-primary"
        }`}
      >
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-[300px] bg-surface rounded-xl shadow-main border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <HexagonAvatar
                src="/images/avatars/avatar_01.png"
                level={24}
                size="lg"
              />
              <div>
                <h4 className="text-white font-bold text-sm">Hi Marina!</h4>
                <p className="text-text-muted text-xs">@marinavalentine</p>
              </div>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {menuSections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className={sectionIndex > 0 ? "border-t border-border" : ""}
              >
                <div className="px-6 py-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {section.title}
                  </h5>
                </div>
                <div className="pb-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-6 py-2.5 text-sm text-white/80 hover:text-white hover:bg-background/50 transition-all"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-secondary font-bold text-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
