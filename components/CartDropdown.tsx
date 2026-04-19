"use client";

import { useState, useRef, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useCart } from "./CartContext";

const CartDropdown = memo(function CartDropdown() {
  const { items, count, subtotal, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("cartPanel");
  const tc = useTranslations("common");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("title")}
        aria-expanded={isOpen}
        className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-primary hover:text-white transition-all border border-border relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {count > 0 ? (
          <div className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center text-white">
            {count}
          </div>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-14 w-[380px] bg-surface rounded-xl border border-border shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-border bg-linear-to-r from-primary to-secondary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-bold text-sm block">
                    {t("title")}
                  </span>
                  <span className="text-white/70 text-xs">
                    {t("itemCount", { count })}
                  </span>
                </div>
              </div>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-background rounded-xl flex items-center justify-center mb-3">
                    <svg
                      className="w-8 h-8 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-text-muted text-sm font-medium">
                    {t("empty")}
                  </p>
                  <p className="text-text-muted/60 text-xs mt-1">
                    {t("emptyHint")}
                  </p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center gap-4 hover:bg-background/50 transition-colors ${
                      index < items.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 via-secondary/10 to-accent-blue/20 p-1 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.name}
                        </h4>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {item.license ?? "Regular License"} · ×{item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-primary tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          removeItem(item.id);
                          toast.success(tc("success"));
                        }}
                        className="block text-[10px] text-text-muted hover:text-accent-orange transition-colors mt-0.5 ml-auto"
                      >
                        {tc("delete")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 ? (
              <div className="p-4 border-t border-border bg-background/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-text-muted">
                    {t("subtotal")}:
                  </span>
                  <span className="text-xl font-black text-white tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/marketplace/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full py-3 bg-linear-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/30"
                >
                  {t("checkout")}
                </Link>
                <Link
                  href="/marketplace"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full py-2 mt-2 text-sm text-text-muted hover:text-white transition-colors"
                >
                  {t("continue")}
                </Link>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
});

export default CartDropdown;
