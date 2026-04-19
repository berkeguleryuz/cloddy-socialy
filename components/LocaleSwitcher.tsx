"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition, useRef, useEffect, useState } from "react";
import { setLocale } from "@/i18n/actions";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n-config";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
  align?: "left" | "right";
}

export function LocaleSwitcher({
  className,
  align = "right",
}: LocaleSwitcherProps) {
  const current = useLocale() as Locale;
  const t = useTranslations("locale");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSelect(locale: Locale) {
    if (locale === current) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setLocale(locale);
      setOpen(false);
    });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("switchLanguage")}
        disabled={isPending}
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-surface border border-border text-xs font-bold text-text-main hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true">{LOCALE_LABELS[current].flag}</span>
        <span className="uppercase tracking-wider">{current}</span>
        <svg
          className={cn("w-3 h-3 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("switchLanguage")}
          className={cn(
            "absolute top-full mt-2 min-w-[180px] rounded-xl bg-surface border border-border shadow-widget overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {SUPPORTED_LOCALES.map((locale) => {
            const isActive = locale === current;
            return (
              <li key={locale} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSelect(locale)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-text-main hover:bg-background"
                  )}
                >
                  <span className="text-base" aria-hidden="true">
                    {LOCALE_LABELS[locale].flag}
                  </span>
                  <span>{LOCALE_LABELS[locale].name}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
