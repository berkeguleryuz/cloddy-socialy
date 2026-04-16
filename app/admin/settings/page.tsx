'use client'

import { useEffect, useState, useCallback } from 'react'

interface Setting {
  key: string
  value: any
  description: string
  isPublic: boolean
  updatedAt: string
}

interface GroupedSettings {
  [category: string]: Setting[]
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GroupedSettings>({})
  const [loading, setLoading] = useState(true)
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [editValue, setEditValue] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data.settings || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting)
    setEditValue(
      typeof setting.value === 'object'
        ? JSON.stringify(setting.value, null, 2)
        : String(setting.value)
    )
  }

  const handleSave = async () => {
    if (!editingSetting) return
    setActionLoading(true)

    try {
      let parsedValue: any = editValue

      // Try to parse as JSON
      try {
        parsedValue = JSON.parse(editValue)
      } catch {
        // Keep as string if not valid JSON
        // Try to parse as number
        if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
          parsedValue = Number(editValue)
        } else if (editValue === 'true') {
          parsedValue = true
        } else if (editValue === 'false') {
          parsedValue = false
        }
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editingSetting.key,
          value: parsedValue,
        }),
      })

      if (!response.ok) throw new Error('Failed to update setting')

      await fetchSettings()
      setEditingSetting(null)
      setSuccessMessage('Setting updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-text-muted">Configure platform-wide settings</p>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {Object.keys(settings).length === 0 ? (
        <div className="widget-box p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-text-muted">No settings configured yet</p>
          <p className="text-sm text-text-muted mt-1">Settings will appear here once they are added to the database</p>
        </div>
      ) : (
        Object.entries(settings).map(([category, categorySettings]) => (
          <div key={category} className="widget-box p-6">
            <h2 className="text-lg font-bold text-white mb-4 capitalize">{category}</h2>

            <div className="space-y-4">
              {categorySettings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-start justify-between p-4 bg-background rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{setting.key}</p>
                      {setting.isPublic && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                          Public
                        </span>
                      )}
                    </div>
                    {setting.description && (
                      <p className="text-sm text-text-muted mt-1">{setting.description}</p>
                    )}
                    <p className="text-sm font-mono text-primary mt-2 truncate max-w-md">
                      {formatValue(setting.value)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Updated: {new Date(setting.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(setting)}
                    className="p-2 hover:bg-background-lighter rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editingSetting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="widget-box w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-white mb-4">Edit Setting</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Key</label>
                <p className="text-white font-mono">{editingSetting.key}</p>
              </div>

              {editingSetting.description && (
                <div>
                  <label className="block text-sm text-text-muted mb-1">Description</label>
                  <p className="text-text-muted text-sm">{editingSetting.description}</p>
                </div>
              )}

              <div>
                <label className="block text-sm text-text-muted mb-1">Value</label>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={typeof editingSetting.value === 'object' ? 6 : 3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white font-mono text-sm resize-none"
                />
                <p className="text-xs text-text-muted mt-1">
                  Enter JSON for objects/arrays, or plain values for strings/numbers/booleans
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingSetting(null)}
                  className="flex-1 px-4 py-2 bg-background text-text-muted rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
