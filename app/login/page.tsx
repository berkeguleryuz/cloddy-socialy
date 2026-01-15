"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(119, 80, 248, 0.1) 0%, rgba(35, 210, 226, 0.1) 100%)",
          }}
        ></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-24 h-24 hexagon-mask bg-primary flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(119,80,248,0.5)]">
            <span className="text-4xl font-black text-white italic">C</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
            Welcome to <br />
            <span className="text-primary italic">Cloddy</span>
          </h1>
          <p className="text-lg text-text-muted font-bold max-w-md leading-relaxed">
            The next generation social network & community! Connect with friends
            and have fun with our gamified platform.
          </p>

          <div className="mt-12 flex gap-4">
            <Link
              href="/"
              className="px-8 py-4 bg-primary text-white text-xs font-black uppercase rounded-lg shadow-xl hover:scale-105 transition-transform"
            >
              Explore Now
            </Link>
          </div>
        </div>

        <div className="widget-box p-0 overflow-hidden shadow-2xl">
          <div className="flex bg-background/50 border-b border-border">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-6 text-xs font-black uppercase transition-all border-b-4 ${
                activeTab === "login"
                  ? "border-primary text-white"
                  : "border-transparent text-text-muted hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-6 text-xs font-black uppercase transition-all border-b-4 ${
                activeTab === "register"
                  ? "border-secondary text-white"
                  : "border-transparent text-text-muted hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="text-xl font-black text-white uppercase mb-8">
              {activeTab === "login" ? "Account Login" : "Create your Account"}
            </h2>

            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username or Email"
                  className="w-full bg-background border-2 border-border rounded-xl py-4 px-6 text-sm font-bold text-white placeholder-text-muted outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-background border-2 border-border rounded-xl py-4 px-6 text-sm font-bold text-white placeholder-text-muted outline-none focus:border-primary transition-colors"
                />
              </div>

              {activeTab === "register" ? (
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repeat Password"
                    className="w-full bg-background border-2 border-border rounded-xl py-4 px-6 text-sm font-bold text-white placeholder-text-muted outline-none focus:border-primary transition-colors"
                  />
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 bg-background border-2 border-border rounded-md checked:bg-primary transition-all"
                  />
                  <span className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">
                    Remember Me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-text-muted hover:text-primary transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                className={`w-full py-4 text-xs font-black uppercase text-white rounded-xl shadow-xl hover:scale-[1.02] transition-transform ${
                  activeTab === "login" ? "bg-primary" : "bg-secondary"
                }`}
              >
                {activeTab === "login"
                  ? "Login to your Account"
                  : "Register Now!"}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs font-bold text-text-muted uppercase mb-6">
                Login with your Social Account
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#3b5998] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                  <span className="font-black italic">f</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#1da1f2] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                  <span className="font-black italic">t</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#ea4335] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                  <span className="font-black italic">G</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
