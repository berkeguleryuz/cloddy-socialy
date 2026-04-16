'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface UserDetail {
  id: string
  display_name: string
  email: string
  wallet_address: string
  auth_method: string
  email_verified: boolean
  level: number
  xp: number
  bio: string
  avatar_url: string
  is_suspended: boolean
  suspension?: {
    reason: string
    suspension_type: string
    ends_at: string | null
    created_at: string
  }
  roles: string[]
  created_at: string
  last_login: string
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspensionType, setSuspensionType] = useState<'temporary' | 'permanent'>('temporary')
  const [duration, setDuration] = useState(24)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return
    setActionLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${params.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: suspendReason,
          suspensionType,
          duration: suspensionType === 'temporary' ? duration : undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to suspend user')

      // Refresh user data
      const userResponse = await fetch(`/api/admin/users/${params.id}`)
      const data = await userResponse.json()
      setUser(data.user)
      setShowSuspendModal(false)
      setSuspendReason('')
    } catch (error) {
      console.error('Error suspending user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleLiftSuspension = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}/suspend`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Suspension lifted by admin' }),
      })

      if (!response.ok) throw new Error('Failed to lift suspension')

      // Refresh user data
      const userResponse = await fetch(`/api/admin/users/${params.id}`)
      const data = await userResponse.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error lifting suspension:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">User not found</p>
        <button
          onClick={() => router.push('/admin/users')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/users')}
          className="p-2 hover:bg-background-lighter rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.display_name || 'Unnamed User'}</h1>
          <p className="text-text-muted">User Details</p>
        </div>
      </div>

      {/* Suspension Alert */}
      {user.is_suspended && user.suspension && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-medium text-red-400">
                {user.suspension.suspension_type === 'permanent' ? 'Permanently Suspended' : 'Temporarily Suspended'}
              </h3>
              <p className="text-sm text-text-muted mt-1">Reason: {user.suspension.reason}</p>
              {user.suspension.ends_at && (
                <p className="text-sm text-text-muted">
                  Ends: {new Date(user.suspension.ends_at).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleLiftSuspension}
              disabled={actionLoading}
              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Lift Suspension'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2 widget-box p-6">
          <h2 className="text-lg font-bold text-white mb-4">User Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-muted">Display Name</label>
              <p className="text-white">{user.display_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Email</label>
              <div className="flex items-center gap-2">
                <p className="text-white">{user.email || '-'}</p>
                {user.email && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.email_verified
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {user.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-text-muted">Wallet Address</label>
              <p className="text-white font-mono text-sm">
                {user.wallet_address || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Auth Method</label>
              <p className="text-white capitalize">{user.auth_method}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Level</label>
              <p className="text-white">
                <span className="text-primary font-bold">{user.level}</span>
                <span className="text-text-muted ml-2">({user.xp} XP)</span>
              </p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Joined</label>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-text-muted">Bio</label>
              <p className="text-white">{user.bio || '-'}</p>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="widget-box p-6">
          <h2 className="text-lg font-bold text-white mb-4">Actions</h2>

          <div className="space-y-3">
            {!user.is_suspended ? (
              <button
                onClick={() => setShowSuspendModal(true)}
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Suspend User
              </button>
            ) : (
              <button
                onClick={handleLiftSuspension}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Lift Suspension
              </button>
            )}

            <button
              onClick={() => router.push(`/admin/audit-logs?targetId=${user.id}`)}
              className="w-full px-4 py-2 bg-background text-text-muted rounded-xl hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Activity Log
            </button>
          </div>

          {/* Roles */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-text-muted mb-2">Roles</h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <span
                    key={role}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      role === 'super_admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : role === 'moderator'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-text-muted text-sm">No special roles</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="widget-box w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-white mb-4">Suspend User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Suspension Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuspensionType('temporary')}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm transition-colors ${
                      suspensionType === 'temporary'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-muted hover:text-white'
                    }`}
                  >
                    Temporary
                  </button>
                  <button
                    onClick={() => setSuspensionType('permanent')}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm transition-colors ${
                      suspensionType === 'permanent'
                        ? 'bg-red-500 text-white'
                        : 'bg-background text-text-muted hover:text-white'
                    }`}
                  >
                    Permanent
                  </button>
                </div>
              </div>

              {suspensionType === 'temporary' && (
                <div>
                  <label className="block text-sm text-text-muted mb-1">Duration (hours)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={72}>3 days</option>
                    <option value={168}>1 week</option>
                    <option value={720}>30 days</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm text-text-muted mb-1">Reason</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="flex-1 px-4 py-2 bg-background text-text-muted rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={!suspendReason.trim() || actionLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Suspend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
