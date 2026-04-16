'use client'

import { useEffect, useState, useCallback } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface Badge {
  id: string
  name: string
  description: string
  image_url: string
  category: string
  rarity: string
  xp_reward: number
  is_active: boolean
  created_at: string
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    category: 'achievement',
    rarity: 'common',
    xp_reward: 100,
  })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBadges = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/badges')
      if (!response.ok) throw new Error('Failed to fetch badges')
      const data = await response.json()
      setBadges(data.badges || [])
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      const url = editingBadge
        ? `/api/admin/badges/${editingBadge.id}`
        : '/api/admin/badges'
      const method = editingBadge ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save badge')

      await fetchBadges()
      setShowCreateModal(false)
      setEditingBadge(null)
      setFormData({
        name: '',
        description: '',
        image_url: '',
        category: 'achievement',
        rarity: 'common',
        xp_reward: 100,
      })
    } catch (error) {
      console.error('Error saving badge:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (badge: Badge) => {
    setEditingBadge(badge)
    setFormData({
      name: badge.name,
      description: badge.description,
      image_url: badge.image_url,
      category: badge.category,
      rarity: badge.rarity,
      xp_reward: badge.xp_reward,
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return

    try {
      const response = await fetch(`/api/admin/badges/${badgeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete badge')

      await fetchBadges()
    } catch (error) {
      console.error('Error deleting badge:', error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'epic':
        return 'bg-purple-500/20 text-purple-400'
      case 'rare':
        return 'bg-blue-500/20 text-blue-400'
      case 'uncommon':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const columns: Column<Badge>[] = [
    {
      key: 'name',
      label: 'Badge',
      render: (badge) => (
        <div className="flex items-center gap-3">
          {badge.image_url ? (
            <img
              src={badge.image_url}
              alt={badge.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-white">{badge.name}</p>
            <p className="text-xs text-text-muted truncate max-w-[200px]">{badge.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (badge) => (
        <span className="text-text-muted capitalize">{badge.category}</span>
      ),
    },
    {
      key: 'rarity',
      label: 'Rarity',
      render: (badge) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
          {badge.rarity}
        </span>
      ),
    },
    {
      key: 'xp_reward',
      label: 'XP Reward',
      render: (badge) => (
        <span className="text-primary font-medium">{badge.xp_reward} XP</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (badge) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          badge.is_active
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {badge.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (badge) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(badge)
            }}
            className="p-2 hover:bg-background-lighter rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(badge.id)
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
          <h1 className="text-2xl font-bold text-white mb-2">Badges</h1>
          <p className="text-text-muted">{badges.length} badges</p>
        </div>
        <button
          onClick={() => {
            setEditingBadge(null)
            setFormData({
              name: '',
              description: '',
              image_url: '',
              category: 'achievement',
              rarity: 'common',
              xp_reward: 100,
            })
            setShowCreateModal(true)
          }}
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Create Badge
        </button>
      </div>

      <DataTable
        data={badges}
        columns={columns}
        loading={loading}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="widget-box w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBadge ? 'Edit Badge' : 'Create Badge'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                  >
                    <option value="achievement">Achievement</option>
                    <option value="social">Social</option>
                    <option value="event">Event</option>
                    <option value="special">Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Rarity</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">XP Reward</label>
                <input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingBadge(null)
                  }}
                  className="flex-1 px-4 py-2 bg-background text-text-muted rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingBadge ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
