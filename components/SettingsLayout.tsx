"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const settingsNav = [
  {
    section: "MY PROFILE",
    items: [
      { label: "Profile Info", href: "/settings/profile" },
      { label: "Social & Stream", href: "/settings/social" },
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Messages", href: "/settings/messages" },
      { label: "Friend Requests", href: "/settings/friend-requests" },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { label: "Account Info", href: "/settings/account" },
      { label: "Change Password", href: "/settings/password" },
      { label: "General Settings", href: "/settings/general" },
    ],
  },
  {
    section: "GROUPS",
    items: [
      { label: "Manage Groups", href: "/settings/groups" },
      { label: "Invitations", href: "/settings/invitations" },
    ],
  },
  {
    section: "MY STORE",
    items: [
      { label: "My Account", href: "/settings/store" },
      { label: "Sales Statement", href: "/settings/sales" },
      { label: "Manage Items", href: "/settings/items" },
      { label: "Downloads", href: "/settings/downloads" },
    ],
  },
];

export default function SettingsLayout({
  children,
  title,
  description,
}: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative w-full h-[120px] rounded-xl overflow-hidden bg-linear-to-r from-primary via-accent-blue to-secondary">
        <div className="absolute inset-0 flex items-center pl-8">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mr-4">
            <svg
              className="w-7 h-7 text-white"
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
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">
              {title}
            </h1>
            {description ? (
              <p className="text-white/80 text-sm font-medium">{description}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="widget-box p-0 overflow-hidden h-fit">
          {settingsNav.map((section, sectionIndex) => (
            <div
              key={section.section}
              className={sectionIndex > 0 ? "border-t border-border" : ""}
            >
              <div className="px-6 py-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {section.section}
                </h5>
              </div>
              <div className="pb-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm transition-all ${
                      pathname === item.href
                        ? "text-primary bg-primary/10 border-l-4 border-primary"
                        : "text-white/80 hover:text-white hover:bg-background/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
