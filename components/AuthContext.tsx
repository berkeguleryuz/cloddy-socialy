"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react"
import {
  useAccount,
  useDisconnect,
  useChainId,
} from "wagmi"
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit"
import type { AuthUser, AuthStatus, AuthMode, AuthMethod } from "@/types/auth"

// Demo user for demo mode
const demoUser: AuthUser = {
  id: "demo-user",
  name: "Marina Valentine",
  email: "marina@demo.com",
  avatar: "/images/avatars/avatar_01.png",
  level: 24,
  experiencePoints: 5320,
  authMethod: "email",
  emailVerified: true,
}

// Legacy User interface for backwards compatibility
interface User {
  id: string
  name: string
  email: string | null
  avatar: string
  level: number
  walletAddress?: string
  ens?: string
  experiencePoints?: number
  emailVerified?: boolean
  authMethod?: AuthMethod
}

interface AuthContextType {
  // Core state
  user: User | null
  isDemo: boolean
  isAuthenticated: boolean

  // Web3 specific
  isWeb3: boolean
  isEmail: boolean
  isHybrid: boolean
  walletAddress: string | null
  chainId: number | null
  authStatus: AuthStatus
  authMode: AuthMode

  // Email auth specific
  emailVerified: boolean
  requiresVerification: boolean

  // Actions - Email Auth
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>
  registerWithEmail: (email: string, password: string, username?: string, displayName?: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>

  // Actions - Linking
  linkWallet: (message: string, signature: string) => Promise<{ success: boolean; error?: string }>
  linkEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>

  // Actions - Legacy/General
  loginWithGoogle: () => Promise<void>
  enterDemoMode: () => void
  logout: () => void
  connectWallet: () => void
  disconnectWallet: () => void
  openAccountModal: () => void
  openChainModal: () => void
  refreshUser: () => Promise<void>

  // Loading states
  isLoading: boolean
  isConnecting: boolean
  isSubmitting: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Local state
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unauthenticated")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Wagmi hooks
  const { address, isConnected, isConnecting: wagmiConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  // RainbowKit modal hooks
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()

  // Derive auth mode
  const authMode: AuthMode = useMemo(() => {
    if (isDemo) return "demo"
    if (user?.authMethod === "both" || (isConnected && user)) return "web3"
    if (user?.authMethod === "email") return "email"
    return "unauthenticated"
  }, [isDemo, isConnected, user])

  // Derived states
  const isWeb3 = authMode === "web3" && user?.authMethod !== "email"
  const isEmail = user?.authMethod === "email"
  const isHybrid = user?.authMethod === "both"
  const emailVerified = user?.emailVerified ?? false
  const requiresVerification = !isDemo && user !== null && user.authMethod !== "web3" && !emailVerified

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
          setAuthStatus("authenticated")
        } else {
          setUser(null)
          setAuthStatus("unauthenticated")
        }
      }
    } catch (error) {
      console.warn("Failed to refresh user:", error)
    }
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setUser(data.user)
            setAuthStatus("authenticated")
          }
        }
      } catch (error) {
        console.warn("Session check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isDemo) {
      checkSession()
    } else {
      setIsLoading(false)
    }
  }, [isDemo])

  // Listen for auth events
  useEffect(() => {
    function handleAuthSuccess() {
      refreshUser()
    }

    function handleAuthLogout() {
      setUser(null)
      setAuthStatus("unauthenticated")
    }

    window.addEventListener("web3-auth-success", handleAuthSuccess)
    window.addEventListener("email-auth-success", handleAuthSuccess)
    window.addEventListener("web3-auth-logout", handleAuthLogout)
    window.addEventListener("auth-logout", handleAuthLogout)

    return () => {
      window.removeEventListener("web3-auth-success", handleAuthSuccess)
      window.removeEventListener("email-auth-success", handleAuthSuccess)
      window.removeEventListener("web3-auth-logout", handleAuthLogout)
      window.removeEventListener("auth-logout", handleAuthLogout)
    }
  }, [refreshUser])

  // Handle wallet disconnect (only for web3-only users)
  useEffect(() => {
    if (!isConnected && user && !isDemo && user.authMethod === "web3") {
      setUser(null)
      setAuthStatus("unauthenticated")
    }
  }, [isConnected, user, isDemo])

  // Email login
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      if (data.success && data.user) {
        setUser(data.user)
        setAuthStatus("authenticated")
        window.dispatchEvent(new CustomEvent("email-auth-success"))
      }

      return {
        success: true,
        requiresVerification: data.requiresVerification,
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Email registration
  const registerWithEmail = useCallback(async (
    email: string,
    password: string,
    username?: string,
    displayName?: string
  ) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, displayName }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" }
      }

      if (data.success && data.user) {
        setUser(data.user)
        setAuthStatus("authenticated")
        window.dispatchEvent(new CustomEvent("email-auth-success"))
      }

      return {
        success: true,
        requiresVerification: data.requiresVerification,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Request failed" }
      }

      return { success: true }
    } catch (error) {
      console.error("Forgot password error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Reset failed" }
      }

      return { success: true }
    } catch (error) {
      console.error("Reset password error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Resend verification email
  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) {
      return { success: false, error: "No email address" }
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Request failed" }
      }

      return { success: true }
    } catch (error) {
      console.error("Resend verification error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [user?.email])

  // Link wallet to email account
  const linkWallet = useCallback(async (message: string, signature: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Linking failed" }
      }

      if (data.success && data.user) {
        setUser(data.user)
      }

      return { success: true }
    } catch (error) {
      console.error("Link wallet error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Link email to wallet account
  const linkEmail = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/auth/link-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Linking failed" }
      }

      if (data.success && data.user) {
        setUser(data.user)
      }

      return { success: true }
    } catch (error) {
      console.error("Link email error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Enter demo mode
  const enterDemoMode = useCallback(() => {
    if (isConnected) {
      disconnect()
    }
    setUser(demoUser)
    setIsDemo(true)
    setAuthStatus("demo")
  }, [isConnected, disconnect])

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      if (!isDemo) {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        })
        if (isConnected) {
          disconnect()
        }
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setIsDemo(false)
      setAuthStatus("unauthenticated")
      window.dispatchEvent(new CustomEvent("auth-logout"))
    }
  }, [isDemo, isConnected, disconnect])

  // Connect wallet (open RainbowKit modal)
  const connectWallet = useCallback(() => {
    if (openConnectModal) {
      openConnectModal()
    }
  }, [openConnectModal])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect()
    // Only clear user if web3-only
    if (user?.authMethod === "web3") {
      setUser(null)
      setAuthStatus("unauthenticated")
    }
  }, [disconnect, user?.authMethod])

  // Legacy login with Google (placeholder)
  const loginWithGoogle = useCallback(async () => {
    console.warn("Google login not implemented. Use wallet connection or email instead.")
    connectWallet()
  }, [connectWallet])

  // Context value
  const value = useMemo(
    () => ({
      user: user as User | null,
      isDemo,
      isAuthenticated: user !== null,
      isWeb3,
      isEmail,
      isHybrid,
      walletAddress: address ?? null,
      chainId: chainId ?? null,
      authStatus,
      authMode,
      emailVerified,
      requiresVerification,
      loginWithEmail,
      registerWithEmail,
      forgotPassword,
      resetPassword,
      resendVerificationEmail,
      linkWallet,
      linkEmail,
      loginWithGoogle,
      enterDemoMode,
      logout: handleLogout,
      connectWallet,
      disconnectWallet,
      openAccountModal: openAccountModal ?? (() => {}),
      openChainModal: openChainModal ?? (() => {}),
      refreshUser,
      isLoading,
      isConnecting: wagmiConnecting,
      isSubmitting,
    }),
    [
      user,
      isDemo,
      isWeb3,
      isEmail,
      isHybrid,
      address,
      chainId,
      authStatus,
      authMode,
      emailVerified,
      requiresVerification,
      loginWithEmail,
      registerWithEmail,
      forgotPassword,
      resetPassword,
      resendVerificationEmail,
      linkWallet,
      linkEmail,
      loginWithGoogle,
      enterDemoMode,
      handleLogout,
      connectWallet,
      disconnectWallet,
      openAccountModal,
      openChainModal,
      refreshUser,
      isLoading,
      wagmiConnecting,
      isSubmitting,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export type { User, AuthContextType }
