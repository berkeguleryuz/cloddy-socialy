'use client'

import { useEffect, useState, useCallback } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface Quest {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  xp_reward: number
  requirements: Record<string, any>
  is_active: boolean
  is_daily: boolean
  is_weekly: boolean
  created_at: string
}

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'social',
    difficulty: 'easy',
    xp_reward: 50,
    is_daily: false,
    is_weekly: false,
    requirements: '{}',
  })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchQuests = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/quests')
      if (!response.ok) throw new Error('Failed to fetch quests')
      const data = await response.json()
      setQuests(data.quests || [])
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      let requirements = {}
      try {
        requirements = JSON.parse(formData.requirements)
      } catch {
        // Invalid JSON, use empty object
      }

      const url = editingQuest
        ? `/api/admin/quests/${editingQuest.id}`
        : '/api/admin/quests'
      const method = editingQuest ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements,
        }),
      })

      if (!response.ok) throw new Error('Failed to save quest')

      await fetchQuests()
      setShowCreateModal(false)
      setEditingQuest(null)
      setFormData({
        title: '',
        description: '',
        category: 'social',
        difficulty: 'easy',
        xp_reward: 50,
        is_daily: false,
        is_weekly: false,
        requirements: '{}',
      })
    } catch (error) {
      console.error('Error saving quest:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest)
    setFormData({
      title: quest.title,
      description: quest.description,
      category: quest.category,
      difficulty: quest.difficulty,
      xp_reward: quest.xp_reward,
      is_daily: quest.is_daily,
      is_weekly: quest.is_weekly,
      requirements: JSON.stringify(quest.requirements, null, 2),
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return

    try {
      const response = await fetch(`/api/admin/quests/${questId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete quest')

      await fetchQuests()
    } catch (error) {
      console.error('Error deleting quest:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'hard':
        return 'bg-red-500/20 text-red-400'
      case 'medium':
        return 'bg-orange-500/20 text-orange-400'
      default:
        return 'bg-green-500/20 text-green-400'
    }
  }

  const columns: Column<Quest>[] = [
    {
      key: 'title',
      label: 'Quest',
      render: (quest) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{quest.title}</p>
            {quest.is_daily && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">Daily</span>
            )}
            {quest.is_weekly && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">Weekly</span>
            )}
          </div>
          <p className="text-xs text-text-muted truncate max-w-[300px]">{quest.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (quest) => (
        <span className="text-text-muted capitalize">{quest.category}</span>
      ),
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (quest) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
          {quest.difficulty}
        </span>
      ),
    },
    {
      key: 'xp_reward',
      label: 'XP Reward',
      render: (quest) => (
        <span className="text-primary font-medium">{quest.xp_reward} XP</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (quest) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          quest.is_active
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {quest.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (quest) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(quest)
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
              handleDelete(quest.id)
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
          <h1 className="text-2xl font-bold text-white mb-2">Quests</h1>
          <p className="text-text-muted">{quests.length} quests</p>
        </div>
        <button
          onClick={() => {
            setEditingQuest(null)
            setFormData({
              title: '',
              description: '',
              category: 'social',
              difficulty: 'easy',
              xp_reward: 50,
              is_daily: false,
              is_weekly: false,
              requirements: '{}',
            })
            setShowCreateModal(true)
          }}
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Create Quest
        </button>
      </div>

      <DataTable
        data={quests}
        columns={columns}
        loading={loading}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="widget-box w-full max-w-lg p-6 animate-in zoom-in-95 my-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingQuest ? 'Edit Quest' : 'Create Quest'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                  >
                    <option value="social">Social</option>
                    <option value="content">Content</option>
                    <option value="engagement">Engagement</option>
                    <option value="achievement">Achievement</option>
                    <option value="special">Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
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

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_daily}
                    onChange={(e) => setFormData({ ...formData, is_daily: e.target.checked })}
                    className="w-4 h-4 rounded border-border bg-background text-primary"
                  />
                  <span className="text-sm text-text-muted">Daily Quest</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_weekly}
                    onChange={(e) => setFormData({ ...formData, is_weekly: e.target.checked })}
                    className="w-4 h-4 rounded border-border bg-background text-primary"
                  />
                  <span className="text-sm text-text-muted">Weekly Quest</span>
                </label>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Requirements (JSON)</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  placeholder='{"action": "post", "count": 5}'
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white font-mono text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingQuest(null)
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
                  {actionLoading ? 'Saving...' : editingQuest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
