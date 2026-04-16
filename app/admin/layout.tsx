'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (isLoading) return

      if (!isAuthenticated || !user) {
        router.push('/')
        return
      }

      try {
        // Check if user has admin access
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          setIsAdmin(true)
        } else if (response.status === 403) {
          // Not authorized
          router.push('/')
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}
