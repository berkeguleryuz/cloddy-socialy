"use client";

import { useState } from "react";
import Link from "next/link";

const orderItems = [
  { name: "Twitch Stream UI Pack", license: "Regular License", price: 12.0 },
  { name: "Gaming Coin Badges Pack", license: "Regular License", price: 6.0 },
  {
    name: "Pixel Diamond Gaming Magazine",
    license: "Regular License",
    price: 26.0,
  },
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">(
    "paypal"
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "United States",
    address: "",
    city: "",
    zipCode: "",
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const discount = 5.0;
  const total = subtotal - discount;

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
        <Link
          href="/marketplace/cart"
          className="text-text-muted hover:text-primary transition-colors font-medium"
        >
          Shopping Cart
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-white font-bold">Checkout</span>
      </div>

      <div className="widget-box p-6">
        <h1 className="text-xl font-black">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="widget-box p-6">
            <h3 className="text-sm font-bold uppercase mb-6">
              Billing Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-muted block mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your first name..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted block mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your last name..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-text-muted block mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your email address..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-text-muted block mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Turkey</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-text-muted block mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your street address..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted block mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your city..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted block mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your ZIP code..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="widget-box p-6">
            <h3 className="text-sm font-bold uppercase mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-xs"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-text-muted">{item.license}</p>
                  </div>
                  <span className="font-bold">
                    $ {item.price.toFixed(2)} x 1
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-border text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">
                  Cart Total ({orderItems.length})
                </span>
                <span className="font-bold">$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-accent-green">
                <span>Code</span>
                <span className="font-bold">-$ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold">Total</span>
                <span className="font-black text-primary">
                  $ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="widget-box p-6">
            <h3 className="text-sm font-bold uppercase mb-4">Payment Method</h3>
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === "paypal"
                    ? "bg-primary/10 border border-primary"
                    : "bg-background border border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#00457C]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.773.773 0 0 1 .763-.645h6.884c2.284 0 4.042.636 5.066 1.84.965 1.135 1.278 2.63.905 4.445-.033.162-.073.32-.116.476a7.8 7.8 0 0 1-.216.642c-.905 2.4-2.89 3.63-5.742 3.63h-1.52a.773.773 0 0 0-.762.645l-.77 4.884a.643.643 0 0 1-.634.546l-1.726-.046z" />
                    </svg>
                    <span className="text-xs font-bold">PayPal</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    Pay with your PayPal balance or connected bank account!
                    It&apos;s quick and really secure.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "bg-primary/10 border border-primary"
                    : "bg-background border border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-xs font-bold">Credit/Debit Card</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    Pay with your credit or debit card!
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button className="w-full py-4 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Complete Order!
          </button>

          <div className="widget-box p-6 text-center bg-linear-to-r from-primary/10 to-secondary/10">
            <span className="text-4xl font-black text-primary">
              $ {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
