"use client"

import { ReactNode, Suspense, memo, useState, useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Providers } from "@/components/providers/Providers"
import { useAuth } from "@/components/AuthContext"
import { DataProvider } from "@/components/DataContext"
import { SidebarProvider } from "@/components/SidebarContext"
import { useProfileCompletion } from "@/hooks/useProfileCompletion"
import { useLevelUpCelebration } from "@/components/LevelUpCelebration"
import { RealtimeProvider } from "@/components/RealtimeProvider"
import ErrorBoundary from "@/components/ErrorBoundary"

// Dynamically import modals
const ProfileCompletionModal = dynamic(
  () => import("@/components/ProfileCompletionModal"),
  { ssr: false }
)

const AddEmailModal = dynamic(
  () => import("@/components/modals/AddEmailModal"),
  { ssr: false }
)

const ConnectWalletModal = dynamic(
  () => import("@/components/modals/ConnectWalletModal"),
  { ssr: false }
)

const LevelUpCelebration = dynamic(
  () => import("@/components/LevelUpCelebration"),
  { ssr: false }
)

// Skeleton components for loading states
function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-surface z-50 flex items-center justify-between px-6 shadow-[0_0_40px_0_rgba(0,0,0,0.3)]">
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-secondary to-accent-blue" />
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-background rounded-lg animate-pulse" />
        <div className="w-24 h-6 bg-background rounded animate-pulse hidden sm:block" />
      </div>
      <div className="flex-1 max-w-xl px-4 md:px-12">
        <div className="w-full h-11 bg-background rounded-xl animate-pulse" />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-6 bg-background rounded animate-pulse hidden lg:block" />
        <div className="w-12 h-12 bg-background rounded-full animate-pulse" />
      </div>
    </nav>
  )
}

function SidebarSkeleton() {
  return (
    <aside className="fixed top-20 left-0 w-72 h-[calc(100vh-80px)] bg-surface p-4">
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-background rounded-lg animate-pulse" />
        ))}
      </div>
    </aside>
  )
}

// Lazy load components with SSR enabled for better FCP
const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0d0f13] flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary animate-pulse" />
    </div>
  ),
})

const Navbar = dynamic(() => import("@/components/Navbar"), {
  loading: () => <NavbarSkeleton />,
})

const SidebarLeft = dynamic(() => import("@/components/SidebarLeft"), {
  loading: () => <SidebarSkeleton />,
})

const SidebarRight = dynamic(() => import("@/components/SidebarRight"), {
  loading: () => <SidebarSkeleton />,
})

// Email Verification Banner
function EmailVerificationBanner() {
  const { user, resendVerificationEmail, isSubmitting } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user || user.emailVerified || !user.email || isDismissed) {
    return null
  }

  const handleResend = async () => {
    const result = await resendVerificationEmail()
    if (result.success) {
      setMessage({ type: 'success', text: 'Verification email sent!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send email' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4 py-2">
      <div className="max-w-4xl mx-auto bg-accent-orange/20 border border-accent-orange/30 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-white text-sm">
            Please verify your email address to unlock all features.
          </span>
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResend}
            disabled={isSubmitting}
            className="px-3 py-1 text-sm font-medium bg-accent-orange/30 text-white rounded-lg hover:bg-accent-orange/40 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Resend'}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal Controller Component
function ModalController() {
  const { showModal, dismiss, closeModal } = useProfileCompletion()
  const { celebration, closeCelebration } = useLevelUpCelebration()
  const [showAddEmailModal, setShowAddEmailModal] = useState(false)
  const [showConnectWalletModal, setShowConnectWalletModal] = useState(false)

  // Listen for modal open events
  useEffect(() => {
    const handleOpenAddEmail = () => setShowAddEmailModal(true)
    const handleOpenConnectWallet = () => setShowConnectWalletModal(true)

    window.addEventListener('open-add-email-modal', handleOpenAddEmail)
    window.addEventListener('open-connect-wallet-modal', handleOpenConnectWallet)

    return () => {
      window.removeEventListener('open-add-email-modal', handleOpenAddEmail)
      window.removeEventListener('open-connect-wallet-modal', handleOpenConnectWallet)
    }
  }, [])

  return (
    <>
      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showModal}
        onClose={closeModal}
        onDismiss={dismiss}
      />

      {/* Add Email Modal */}
      <AddEmailModal
        isOpen={showAddEmailModal}
        onClose={() => setShowAddEmailModal(false)}
      />

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={showConnectWalletModal}
        onClose={() => setShowConnectWalletModal(false)}
      />

      {/* Level Up Celebration */}
      {celebration && (
        <LevelUpCelebration
          newLevel={celebration.newLevel}
          onClose={closeCelebration}
        />
      )}
    </>
  )
}

function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, requiresVerification } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0d0f13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-[2px] animate-pulse">
            <div className="w-full h-full rounded-2xl bg-[#0d0f13]/90 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                C
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <SidebarProvider>
      <DataProvider>
        <RealtimeProvider>
        <Navbar />
        <SidebarLeft />
        <SidebarRight />

        {/* Email verification banner */}
        {requiresVerification && <EmailVerificationBanner />}

        <main className={`pt-20 min-h-screen ${requiresVerification ? 'mt-14' : ''}`}>
          <div className="content-grid w-full max-w-[1184px] mx-auto px-4 lg:px-6 xl:px-8 py-8">
            {children}
          </div>
        </main>

        <div className="floaty-bar flex items-center justify-around px-4">
          <div className="text-primary">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div className="text-secondary">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary -mt-6 bg-surface p-1 relative">
            <Image
              src={user?.avatar || "/images/avatars/avatar_01.png"}
              alt="User"
              fill
              className="object-cover rounded-full"
              sizes="48px"
            />
          </div>
          <div className="text-accent-blue">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="text-accent-orange">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Modals */}
        <ModalController />
        </RealtimeProvider>
      </DataProvider>
    </SidebarProvider>
  )
}

const ClientLayout = memo(function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Providers>
        <AppLayout>{children}</AppLayout>
      </Providers>
    </ErrorBoundary>
  )
});

export default ClientLayout;
