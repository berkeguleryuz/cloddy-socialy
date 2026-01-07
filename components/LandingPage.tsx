"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import Image from "next/image";

export default function LandingPage() {
  const { loginWithGoogle, enterDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login with:", email, password);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register with:", regUsername, regEmail, regPassword);
  };

  return (
    <div className="fixed inset-0 bg-[#0d0f13] overflow-hidden">
      {/* CSS Keyframes - inline styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-15px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-5px);
          }
          75% {
            transform: translateY(-20px) translateX(3px);
          }
        }
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-float-1 {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float 8s ease-in-out infinite 1s;
        }
        .animate-float-3 {
          animation: float 7s ease-in-out infinite 2s;
        }
        .animate-float-4 {
          animation: float 9s ease-in-out infinite 0.5s;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-slide-up-delay-1 {
          animation: slide-up 0.8s ease-out 0.1s forwards;
          opacity: 0;
        }
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>

      {/* AI Generated Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing/landing_bg.png"
          alt="Background"
          fill
          className="object-cover opacity-25 animate-pulse-glow"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0f13]/80 via-[#0d0f13]/50 to-[#0d0f13]/80" />
      </div>

      {/* Floating Animated Orbs */}
      <div className="animate-float-1 absolute top-20 left-20 w-64 h-64 bg-primary/30 rounded-full blur-[100px] z-[1]" />
      <div className="animate-float-2 absolute bottom-20 right-20 w-80 h-80 bg-secondary/25 rounded-full blur-[120px] z-[1]" />
      <div className="animate-float-3 absolute top-1/2 left-1/3 w-48 h-48 bg-[#21e19f]/20 rounded-full blur-[80px] z-[1]" />
      <div className="animate-float-4 absolute top-1/4 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-[60px] z-[1]" />

      {/* Small floating particles */}
      <div className="animate-float-2 absolute top-[15%] left-[10%] w-2 h-2 bg-primary rounded-full z-[2]" />
      <div className="animate-float-1 absolute top-[25%] left-[25%] w-1 h-1 bg-secondary rounded-full z-[2]" />
      <div className="animate-float-3 absolute top-[60%] left-[15%] w-1.5 h-1.5 bg-[#21e19f] rounded-full z-[2]" />
      <div className="animate-float-4 absolute top-[40%] left-[40%] w-1 h-1 bg-white/50 rounded-full z-[2]" />
      <div className="animate-float-1 absolute top-[70%] left-[30%] w-2 h-2 bg-primary/70 rounded-full z-[2]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Hero */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12">
          <div className="max-w-lg text-center">
            {/* Logo */}
            <div className="mb-8 animate-slide-up">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-[2px] mb-6 animate-gradient">
                <div className="w-full h-full rounded-2xl bg-[#0d0f13]/90 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    C
                  </span>
                </div>
              </div>
              <p className="text-text-muted text-sm uppercase tracking-[0.3em] font-medium mb-2">
                Welcome to
              </p>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
                CLODDY
              </h1>
              <div className="h-1 w-20 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>

            <p className="text-lg text-gray-300 leading-relaxed mb-8 animate-slide-up-delay-1">
              The next generation{" "}
              <span className="text-primary font-semibold">
                gamified social network
              </span>
              ! Connect with friends, earn badges, and level up your social
              experience.
            </p>

            {/* Features with Hexagon Images */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="animate-slide-up-delay-1 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div
                  className="w-16 h-16 mx-auto mb-3 relative overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <Image
                    src="/images/landing/hexagon_badges.png"
                    alt="Badges"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-bold text-white">Badges</p>
              </div>
              <div className="animate-slide-up-delay-2 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-secondary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div
                  className="w-16 h-16 mx-auto mb-3 relative overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <Image
                    src="/images/landing/hexagon_community.png"
                    alt="Community"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-bold text-white">Community</p>
              </div>
              <div className="animate-slide-up-delay-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#21e19f]/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div
                  className="w-16 h-16 mx-auto mb-3 relative overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <Image
                    src="/images/landing/hexagon_quests.png"
                    alt="Quests"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-bold text-white">Quests</p>
              </div>
            </div>

            {/* Demo Button */}
            <div className="animate-slide-up-delay-3">
              <button
                onClick={enterDemoMode}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-secondary to-[#21e19f] text-white font-bold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/30"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Explore Demo
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md animate-slide-up">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-2">CLODDY</h1>
              <p className="text-text-muted text-sm">Gamified Social Network</p>
            </div>

            {/* Form Card - Glassmorphism */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                    activeTab === "login"
                      ? "text-white bg-primary/20 border-b-2 border-primary"
                      : "text-text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                    activeTab === "register"
                      ? "text-white bg-secondary/20 border-b-2 border-secondary"
                      : "text-text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Content */}
              <div className="p-8">
                {activeTab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <h2 className="text-xl font-black text-white mb-6">
                      Account Login
                    </h2>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Email or Username
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                        placeholder="Enter your email..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                        placeholder="Enter your password..."
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                        />
                        <span className="text-text-muted">Remember me</span>
                      </label>
                      <a href="#" className="text-primary hover:underline">
                        Forgot Password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-primary to-[#8b5cf6] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
                    >
                      Login to your Account
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-[#1a1c23] text-text-muted uppercase tracking-wider">
                          or continue with
                        </span>
                      </div>
                    </div>

                    {/* Google Login - Glassmorphism */}
                    <button
                      type="button"
                      onClick={loginWithGoogle}
                      className="w-full py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <h2 className="text-xl font-black text-white mb-4">
                      Create Account
                    </h2>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-secondary focus:bg-white/10 transition-all"
                        placeholder="Choose a username..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-secondary focus:bg-white/10 transition-all"
                        placeholder="Enter your email..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-secondary focus:bg-white/10 transition-all"
                        placeholder="Create a password..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-secondary focus:bg-white/10 transition-all"
                        placeholder="Confirm your password..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-secondary to-[#21e19f] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-secondary/30"
                    >
                      Create Account
                    </button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-[#1a1c23] text-text-muted uppercase tracking-wider">
                          or sign up with
                        </span>
                      </div>
                    </div>

                    {/* Google Sign Up - Glassmorphism */}
                    <button
                      type="button"
                      onClick={loginWithGoogle}
                      className="w-full py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </button>

                    <p className="text-xs text-text-muted text-center mt-4">
                      By signing up, you agree to our{" "}
                      <a href="#" className="text-secondary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-secondary hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                )}

                {/* Demo Mode Button - Mobile */}
                <div className="lg:hidden mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={enterDemoMode}
                    className="w-full py-3 bg-gradient-to-r from-secondary to-[#21e19f] text-white font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Explore Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
