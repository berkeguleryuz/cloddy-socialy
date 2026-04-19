"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/components/CartContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

const PROMO_CODES: Record<string, number> = {
  CLODDY5: 5,
  LAUNCH10: 10,
};

export default function CartPage() {
  const { items, subtotal, count, removeItem, updateQuantity } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const discount = appliedCode ? PROMO_CODES[appliedCode] ?? 0 : 0;
  const total = Math.max(0, subtotal - discount);

  const handleRedeem = () => {
    const normalized = promoCode.trim().toUpperCase();
    if (!normalized) {
      toast.info("Enter a code");
      return;
    }
    if (PROMO_CODES[normalized] !== undefined) {
      setAppliedCode(normalized);
      toast.success(`Code applied: -$${PROMO_CODES[normalized].toFixed(2)}`);
    } else {
      toast.error("Invalid code");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/marketplace"
          className="text-text-muted hover:text-primary transition-colors font-medium"
        >
          Marketplace
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-white font-bold">Shopping Cart</span>
      </div>

      <div className="widget-box p-6">
        <h1 className="text-xl font-black">
          Shopping Cart <span className="text-primary">{count}</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the marketplace to find something awesome."
          action={
            <Link href="/marketplace">
              <Button>Browse marketplace</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="widget-box overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-background/50 text-xs font-bold text-text-muted uppercase border-b border-border">
                <div className="col-span-5">Item</div>
                <div className="col-span-3">License</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-border last:border-0 items-center"
                >
                  <div className="col-span-5 flex gap-4">
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-background">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold block truncate">
                        {item.name}
                      </span>
                      {item.category && (
                        <Link
                          href="/marketplace"
                          className="text-[10px] text-primary font-bold hover:text-secondary transition-colors"
                        >
                          {item.category}
                        </Link>
                      )}
                      {item.author && (
                        <div className="flex items-center gap-2 mt-1">
                          {item.author.avatar && (
                            <div className="w-4 h-4 rounded-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.author.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-[10px] text-text-muted">
                            {item.author.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="px-3 py-2 bg-background rounded-lg text-xs text-text-muted">
                      {item.license ?? "Regular License"}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="Decrease"
                      className="w-7 h-7 rounded-lg bg-background text-text-muted hover:text-white hover:bg-surface transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold tabular-nums w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Increase"
                      className="w-7 h-7 rounded-lg bg-background text-text-muted hover:text-white hover:bg-surface transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id);
                        toast.success("Removed from cart");
                      }}
                      aria-label="Remove"
                      className="w-6 h-6 ml-2 rounded-lg bg-accent-orange/20 text-accent-orange flex items-center justify-center hover:bg-accent-orange/30 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-sm font-black text-primary tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="widget-box p-6">
              <p className="text-xs text-text-muted mb-4">
                Have a promo code? Try <code>CLODDY5</code> or{" "}
                <code>LAUNCH10</code>.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-background rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button onClick={handleRedeem} size="sm">
                  Apply
                </Button>
              </div>
              {appliedCode && (
                <p className="mt-2 text-xs text-secondary font-bold">
                  ✓ {appliedCode} applied
                </p>
              )}
            </div>

            <div className="widget-box p-6">
              <h3 className="text-sm font-bold uppercase mb-4">Order Totals</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Cart ({count})</span>
                  <span className="font-bold tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-secondary">
                    <span>Code</span>
                    <span className="font-bold tabular-nums">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-3 border-t border-border text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-black text-primary tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <Link
                  href="/marketplace/checkout"
                  className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
