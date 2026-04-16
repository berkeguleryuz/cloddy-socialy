'use client'

import { useEffect, useState, useCallback } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface Group {
  id: string
  name: string
  description: string
  cover_image: string
  privacy: string
  member_count: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  creator?: {
    display_name: string
  }
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [privacyFilter, setPrivacyFilter] = useState('')

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (privacyFilter) params.append('privacy', privacyFilter)

      const response = await fetch(`/api/admin/groups?${params}`)
      if (!response.ok) throw new Error('Failed to fetch groups')

      const data = await response.json()
      setGroups(data.groups || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }, [page, privacyFilter])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleToggleVerified = async (groupId: string, isVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !isVerified }),
      })

      if (!response.ok) throw new Error('Failed to update group')

      await fetchGroups()
    } catch (error) {
      console.error('Error updating group:', error)
    }
  }

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete group')

      await fetchGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
    }
  }

  const columns: Column<Group>[] = [
    {
      key: 'name',
      label: 'Group',
      render: (group) => (
        <div className="flex items-center gap-3">
          {group.cover_image ? (
            <img
              src={group.cover_image}
              alt={group.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-white">{group.name}</p>
              {group.is_verified && (
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-text-muted truncate max-w-[200px]">
              {group.description || 'No description'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'member_count',
      label: 'Members',
      render: (group) => (
        <span className="text-white font-medium">{group.member_count || 0}</span>
      ),
    },
    {
      key: 'privacy',
      label: 'Privacy',
      render: (group) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          group.privacy === 'public'
            ? 'bg-green-500/20 text-green-400'
            : group.privacy === 'private'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {group.privacy}
        </span>
      ),
    },
    {
      key: 'creator',
      label: 'Created By',
      render: (group) => (
        <span className="text-text-muted text-sm">
          {group.creator?.display_name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (group) => (
        <span className="text-text-muted text-sm">
          {new Date(group.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (group) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleVerified(group.id, group.is_verified)
            }}
            className={`p-2 rounded-lg transition-colors ${
              group.is_verified
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-background-lighter text-text-muted'
            }`}
            title={group.is_verified ? 'Remove verification' : 'Verify group'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(group.id)
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Groups</h1>
          <p className="text-text-muted">{total} groups</p>
        </div>
      </div>

      {/* Filters */}
      <div className="widget-box p-4">
        <div className="flex flex-wrap gap-2">
          {['', 'public', 'private', 'secret'].map((privacy) => (
            <button
              key={privacy || 'all'}
              onClick={() => {
                setPrivacyFilter(privacy)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                privacyFilter === privacy
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-muted hover:text-white'
              }`}
            >
              {privacy ? privacy.charAt(0).toUpperCase() + privacy.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={groups}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
