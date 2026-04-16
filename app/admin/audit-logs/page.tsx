'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import DataTable, { Column } from '@/components/admin/DataTable'

interface AuditLog {
  id: string
  actor_id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, any> | null
  ip_address: string | null
  created_at: string
  actor?: {
    display_name: string
    email: string
  }
}

const ACTION_LABELS: Record<string, string> = {
  user_suspended: 'User Suspended',
  user_unsuspended: 'User Unsuspended',
  user_role_assigned: 'Role Assigned',
  user_role_removed: 'Role Removed',
  post_deleted: 'Post Deleted',
  comment_deleted: 'Comment Deleted',
  report_resolved: 'Report Resolved',
  report_dismissed: 'Report Dismissed',
  setting_changed: 'Setting Changed',
  badge_created: 'Badge Created',
  badge_updated: 'Badge Updated',
  badge_deleted: 'Badge Deleted',
  quest_created: 'Quest Created',
  quest_updated: 'Quest Updated',
  quest_deleted: 'Quest Deleted',
}

export default function AdminAuditLogsPage() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Get targetId from URL if present
  const targetIdFromUrl = searchParams.get('targetId')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })
      if (actionFilter) params.append('action', actionFilter)
      if (targetIdFromUrl) params.append('targetId', targetIdFromUrl)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const data = await response.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, targetIdFromUrl])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getActionColor = (action: string) => {
    if (action.includes('deleted') || action.includes('suspended')) {
      return 'bg-red-500/20 text-red-400'
    }
    if (action.includes('created')) {
      return 'bg-green-500/20 text-green-400'
    }
    if (action.includes('updated') || action.includes('changed')) {
      return 'bg-blue-500/20 text-blue-400'
    }
    return 'bg-gray-500/20 text-gray-400'
  }

  const columns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      label: 'Time',
      render: (log) => (
        <span className="text-text-muted text-sm">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actor',
      label: 'Actor',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {log.actor?.display_name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-white">{log.actor?.display_name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
          {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'target_type',
      label: 'Target',
      render: (log) => (
        <div className="text-sm">
          {log.target_type && (
            <>
              <span className="text-text-muted capitalize">{log.target_type}</span>
              {log.target_id && (
                <span className="text-text-muted font-mono ml-1 text-xs">
                  ({log.target_id.slice(0, 8)}...)
                </span>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (log) => (
        <span className="text-text-muted text-sm font-mono">
          {log.ip_address || '-'}
        </span>
      ),
    },
    {
      key: 'details',
      label: '',
      render: (log) => (
        log.metadata && Object.keys(log.metadata).length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedLog(log)
            }}
            className="p-2 hover:bg-background-lighter rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )
      ),
    },
  ]

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-text-muted">{total} log entries</p>
      </div>

      {targetIdFromUrl && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-primary text-sm">
            Showing logs for target: <span className="font-mono">{targetIdFromUrl}</span>
          </p>
          <a
            href="/admin/audit-logs"
            className="text-sm text-primary hover:underline"
          >
            Clear filter
          </a>
        </div>
      )}

      {/* Filters */}
      <div className="widget-box p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setPage(1)
            }}
            className="bg-background border border-border rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {ACTION_LABELS[action] || action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
        onRowClick={(log) => log.metadata && Object.keys(log.metadata).length > 0 && setSelectedLog(log)}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="widget-box w-full max-w-lg p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-background-lighter rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted">Action</label>
                  <p className="text-white">{ACTION_LABELS[selectedLog.action] || selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm text-text-muted">Time</label>
                  <p className="text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted">Actor</label>
                <p className="text-white">{selectedLog.actor?.display_name || selectedLog.actor_id}</p>
              </div>

              {selectedLog.target_type && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-muted">Target Type</label>
                    <p className="text-white capitalize">{selectedLog.target_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Target ID</label>
                    <p className="text-white font-mono text-sm">{selectedLog.target_id}</p>
                  </div>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <label className="text-sm text-text-muted">IP Address</label>
                  <p className="text-white font-mono">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm text-text-muted">Metadata</label>
                  <pre className="mt-1 p-3 bg-background rounded-xl text-sm text-text-muted overflow-auto max-h-48">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-4 py-2 bg-background text-text-muted rounded-xl hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
