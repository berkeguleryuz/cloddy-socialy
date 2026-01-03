"use client";

import { useState } from "react";
import Link from "next/link";

const cartItems = [
  {
    id: 1,
    name: "Twitch Stream UI Pack",
    category: "Stream Packs",
    image: "/images/covers/cover_01.png",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
    },
    license: "Regular License",
    price: 12.0,
    quantity: 1,
  },
  {
    id: 2,
    name: "Gaming Coin Badges Pack",
    category: "Illustrations",
    image: "/images/covers/cover_08.png",
    author: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
    },
    license: "Regular License",
    price: 6.0,
    quantity: 1,
  },
  {
    id: 3,
    name: "Pixel Diamond Gaming Magazine",
    category: "HTML Templates",
    image: "/images/covers/cover_07.png",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
    },
    license: "Regular License",
    price: 26.0,
    quantity: 1,
  },
];

export default function CartPage() {
  const [items, setItems] = useState(cartItems);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(5.0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal - discount;

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
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
          Shopping Cart <span className="text-primary">{items.length}</span>
        </h1>
      </div>

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
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/marketplace/product/${item.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="text-sm font-bold hover:text-primary transition-colors block truncate"
                    >
                      {item.name}
                    </Link>
                    <Link
                      href="/marketplace"
                      className="text-[10px] text-primary font-bold hover:text-secondary transition-colors"
                    >
                      {item.category}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-4 h-4 rounded-full overflow-hidden">
                        <img
                          src={item.author.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {item.author.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <select className="w-full px-3 py-2 bg-background rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Regular License</option>
                    <option>Extended License</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center justify-center gap-2">
                  <span className="text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-6 h-6 rounded-lg bg-accent-red/20 text-accent-red flex items-center justify-center hover:bg-accent-red/30 transition-colors"
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
                  <span className="text-sm font-black text-primary">
                    $ {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="widget-box p-6">
            <p className="text-xs text-text-muted mb-4">
              If you have a promotional or a discount code, please enter it
              right here to redeem it!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-background rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/80 transition-colors">
                Redeem Code
              </button>
            </div>
          </div>

          <div className="widget-box p-6">
            <h3 className="text-sm font-bold uppercase mb-4">Order Totals</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Cart ({items.length})</span>
                <span className="font-bold">$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Code</span>
                  <span className="font-bold">-$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-border text-lg">
                <span className="font-bold">Total</span>
                <span className="font-black text-primary">
                  $ {total.toFixed(2)}
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
              <button className="w-full py-3 bg-surface border border-border text-white text-sm font-bold rounded-xl hover:bg-background transition-all">
                Update Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
