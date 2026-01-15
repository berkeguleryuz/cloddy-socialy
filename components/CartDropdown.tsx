"use client";

import { useState, useRef, useEffect } from "react";

const cartItems = [
  {
    id: 1,
    name: "Gem Pack",
    description: "500 premium gems to boost your level",
    price: 4.99,
    image: "/images/shop/gem_pack.png",
    category: "Currency",
  },
  {
    id: 2,
    name: "Pro Bundle",
    description: "1000 gems + exclusive badge + XP boost",
    price: 9.99,
    image: "/images/shop/pro_bundle.png",
    category: "Bundle",
  },
  {
    id: 3,
    name: "VIP Pass",
    description: "30 days of premium perks",
    price: 14.99,
    image: "/images/shop/vip_pass.png",
    category: "Subscription",
  },
];

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

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
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-primary hover:text-white transition-all border border-border relative"
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
        {cartItems.length > 0 ? (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center text-white">
            {cartItems.length}
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
            {/* Header */}
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
                    Shopping Cart
                  </span>
                  <span className="text-white/70 text-xs">
                    {cartItems.length} items
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-[320px] overflow-y-auto">
              {cartItems.length === 0 ? (
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
                    Your cart is empty
                  </p>
                  <p className="text-text-muted/60 text-xs mt-1">
                    Browse the shop to add items
                  </p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center gap-4 hover:bg-background/50 transition-colors ${
                      index < cartItems.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 via-secondary/10 to-accent-blue/20 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                      <button className="block text-[10px] text-text-muted hover:text-red-400 transition-colors mt-0.5">
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 ? (
              <div className="p-4 border-t border-border bg-background/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-text-muted">Subtotal:</span>
                  <span className="text-xl font-black text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button className="w-full py-3 bg-linear-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/30">
                  Proceed to Checkout
                </button>
                <button className="w-full py-2 mt-2 text-sm text-text-muted hover:text-white transition-colors">
                  Continue Shopping →
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
