'use client'

import { useEffect, useState, useCallback } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface Report {
  id: string
  content_type: string
  content_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  reporter: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  reviewer?: {
    id: string
    display_name: string
  }
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/reports?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reports')

      const data = await response.json()
      setReports(data.reports)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleAction = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolutionNotes: resolutionNotes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to update report')

      await fetchReports()
      setSelectedReport(null)
      setResolutionNotes('')
    } catch (error) {
      console.error('Error updating report:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400'
      case 'resolved':
        return 'bg-green-500/20 text-green-400'
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const columns: Column<Report>[] = [
    {
      key: 'content_type',
      label: 'Type',
      render: (report) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
          {report.content_type}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (report) => (
        <div>
          <p className="text-white font-medium capitalize">{report.reason.replace(/_/g, ' ')}</p>
          {report.description && (
            <p className="text-xs text-text-muted truncate max-w-[200px]">{report.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'reporter',
      label: 'Reported By',
      render: (report) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {report.reporter.display_name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-text-muted">{report.reporter.display_name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (report) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Reported',
      render: (report) => (
        <span className="text-text-muted text-sm">
          {new Date(report.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (report) => (
        report.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedReport(report)
            }}
            className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
          >
            Review
          </button>
        )
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Content Moderation</h1>
        <p className="text-text-muted">{total} reports</p>
      </div>

      {/* Filters */}
      <div className="widget-box p-4">
        <div className="flex flex-wrap gap-2">
          {['pending', 'reviewed', 'resolved', 'dismissed', ''].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => {
                setStatusFilter(status)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-muted hover:text-white'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <DataTable
        data={reports}
        columns={columns}
        loading={loading}
        onRowClick={(report) => setSelectedReport(report)}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="widget-box w-full max-w-lg p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
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
                  <label className="text-sm text-text-muted">Content Type</label>
                  <p className="text-white capitalize">{selectedReport.content_type}</p>
                </div>
                <div>
                  <label className="text-sm text-text-muted">Content ID</label>
                  <p className="text-white font-mono text-sm truncate">{selectedReport.content_id}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted">Reason</label>
                <p className="text-white capitalize">{selectedReport.reason.replace(/_/g, ' ')}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm text-text-muted">Description</label>
                  <p className="text-white">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-text-muted">Reported By</label>
                <p className="text-white">{selectedReport.reporter.display_name}</p>
              </div>

              <div>
                <label className="text-sm text-text-muted">Reported At</label>
                <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
              </div>

              {selectedReport.status === 'pending' && (
                <>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Resolution Notes (optional)</label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add notes about this resolution..."
                      rows={3}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleAction(selectedReport.id, 'dismissed')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-xl hover:bg-gray-500/30 transition-colors disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAction(selectedReport.id, 'reviewed')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleAction(selectedReport.id, 'resolved')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  </div>
                </>
              )}

              {selectedReport.status !== 'pending' && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                    {selectedReport.reviewer && (
                      <span className="text-sm text-text-muted">
                        by {selectedReport.reviewer.display_name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
