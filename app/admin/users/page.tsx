'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/admin/DataTable'

interface User {
  id: string
  display_name: string
  email: string
  wallet_address: string
  auth_method: string
  level: number
  xp: number
  is_suspended: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const columns: Column<User>[] = [
    {
      key: 'display_name',
      label: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {user.display_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-white">{user.display_name || 'Unnamed'}</p>
            <p className="text-xs text-text-muted">
              {user.email || user.wallet_address?.slice(0, 10) + '...'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'auth_method',
      label: 'Auth',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.auth_method === 'both'
            ? 'bg-purple-500/20 text-purple-400'
            : user.auth_method === 'email'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          {user.auth_method === 'both' ? 'Hybrid' : user.auth_method === 'email' ? 'Email' : 'Web3'}
        </span>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      render: (user) => (
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">{user.level}</span>
          <span className="text-xs text-text-muted">({user.xp} XP)</span>
        </div>
      ),
    },
    {
      key: 'is_suspended',
      label: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.is_suspended
            ? 'bg-red-500/20 text-red-400'
            : 'bg-green-500/20 text-green-400'
        }`}>
          {user.is_suspended ? 'Suspended' : 'Active'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (user) => (
        <span className="text-text-muted text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Users</h1>
          <p className="text-text-muted">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="widget-box p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or wallet..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 pl-10 text-white focus:border-primary focus:outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="bg-background border border-border rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
