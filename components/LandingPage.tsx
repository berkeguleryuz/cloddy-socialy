"use client"

import { useState, memo } from "react"
import { useAuth } from "./AuthContext"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Image from "next/image"

// Custom Connect Button Component
function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full py-4 bg-gradient-to-r from-primary to-[#8b5cf6] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    <WalletIcon />
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="w-full py-4 bg-gradient-to-r from-primary to-[#8b5cf6] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    {account.displayName}
                    {account.displayBalance && ` (${account.displayBalance})`}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

// Wallet Icon Component
function WalletIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  )
}

// Email Icon Component
function EmailIcon() {
  return (
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
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

const LandingPage = memo(function LandingPage() {
  const { enterDemoMode, loginWithEmail, registerWithEmail, forgotPassword, isSubmitting } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [regUsername, setRegUsername] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")

  // UI states
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showVerificationBanner, setShowVerificationBanner] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    const result = await loginWithEmail(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
    } else if (result.requiresVerification) {
      setShowVerificationBanner(true)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!regEmail || !regPassword || !regConfirmPassword) {
      setError("Please fill in all required fields")
      return
    }

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    const result = await registerWithEmail(regEmail, regPassword, regUsername || undefined)

    if (!result.success) {
      setError(result.error || "Registration failed")
    } else {
      setShowVerificationBanner(true)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!forgotEmail) {
      setError("Please enter your email address")
      return
    }

    const result = await forgotPassword(forgotEmail)

    if (result.success) {
      setSuccess("If an account exists with this email, you will receive a password reset link.")
      setForgotEmail("")
    } else {
      setError(result.error || "Request failed")
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0d0f13] overflow-hidden">
      {/* CSS Keyframes */}
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

            {/* Email Verification Banner */}
            {showVerificationBanner && (
              <div className="mb-4 p-4 bg-secondary/20 border border-secondary/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-white font-semibold text-sm">Check your email!</p>
                    <p className="text-text-muted text-xs mt-1">We&apos;ve sent you a verification link. Please verify your email to access all features.</p>
                  </div>
                  <button
                    onClick={() => setShowVerificationBanner(false)}
                    className="text-text-muted hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Form Card - Glassmorphism */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Tabs */}
              {!showForgotPassword && (
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => {
                      setActiveTab("login")
                      setError(null)
                      setSuccess(null)
                    }}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                      activeTab === "login"
                        ? "text-white bg-primary/20 border-b-2 border-primary"
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("register")
                      setError(null)
                      setSuccess(null)
                    }}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                      activeTab === "register"
                        ? "text-white bg-secondary/20 border-b-2 border-secondary"
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Form Content */}
              <div className="p-8">
                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}

                {showForgotPassword ? (
                  /* Forgot Password Form */
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={() => {
                          setShowForgotPassword(false)
                          setError(null)
                          setSuccess(null)
                        }}
                        className="text-text-muted hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h2 className="text-xl font-black text-white">
                        Reset Password
                      </h2>
                    </div>

                    <p className="text-text-muted text-sm">
                      Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                          placeholder="Enter your email..."
                          disabled={isSubmitting}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-primary to-[#8b5cf6] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </form>
                  </div>
                ) : activeTab === "login" ? (
                  /* Login Form */
                  <div className="space-y-5">
                    <h2 className="text-xl font-black text-white mb-6">
                      Account Login
                    </h2>

                    {/* Web3 Connect Button - Primary */}
                    <div className="mb-6">
                      <CustomConnectButton />
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-[#1a1c23] text-text-muted uppercase tracking-wider">
                          or use email
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                          placeholder="Enter your email..."
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true)
                            setError(null)
                            setSuccess(null)
                          }}
                          className="text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner />
                            Logging in...
                          </>
                        ) : (
                          <>
                            <EmailIcon />
                            Login with Email
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Register Form */
                  <div className="space-y-4">
                    <h2 className="text-xl font-black text-white mb-4">
                      Create Account
                    </h2>

                    {/* Web3 Connect Button - Primary */}
                    <div className="mb-6">
                      <CustomConnectButton />
                    </div>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-[#1a1c23] text-text-muted uppercase tracking-wider">
                          or use email
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                          Username <span className="text-text-muted/50">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-secondary focus:bg-white/10 transition-all"
                          placeholder="Choose a username..."
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          placeholder="Create a password (min 8 chars)..."
                          required
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Must include uppercase, lowercase, and number
                        </p>
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
                          disabled={isSubmitting}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <EmailIcon />
                            Create Account with Email
                          </>
                        )}
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
                  </div>
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
  )
});

export default LandingPage;
