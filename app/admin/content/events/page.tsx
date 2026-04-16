'use client'

import { useEffect, useState, useCallback } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface Event {
  id: string
  title: string
  description: string
  cover_image: string
  start_date: string
  end_date: string
  location: string
  is_virtual: boolean
  max_attendees: number
  attendee_count: number
  status: string
  created_at: string
  creator?: {
    display_name: string
  }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/events?${params}`)
      if (!response.ok) throw new Error('Failed to fetch events')

      const data = await response.json()
      setEvents(data.events || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')

      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400'
      case 'ongoing':
        return 'bg-green-500/20 text-green-400'
      case 'completed':
        return 'bg-gray-500/20 text-gray-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const columns: Column<Event>[] = [
    {
      key: 'title',
      label: 'Event',
      render: (event) => (
        <div className="flex items-center gap-3">
          {event.cover_image ? (
            <img
              src={event.cover_image}
              alt={event.title}
              className="w-12 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-8 rounded bg-primary/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-white">{event.title}</p>
            <p className="text-xs text-text-muted">
              {event.is_virtual ? 'Virtual' : event.location || 'No location'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Date',
      render: (event) => (
        <div className="text-sm">
          <p className="text-white">{new Date(event.start_date).toLocaleDateString()}</p>
          <p className="text-xs text-text-muted">
            {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      key: 'attendee_count',
      label: 'Attendees',
      render: (event) => (
        <span className="text-text-muted">
          {event.attendee_count || 0}
          {event.max_attendees > 0 && ` / ${event.max_attendees}`}
        </span>
      ),
    },
    {
      key: 'creator',
      label: 'Created By',
      render: (event) => (
        <span className="text-text-muted text-sm">
          {event.creator?.display_name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (event) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
          {event.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (event) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(event.id)
          }}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Events</h1>
          <p className="text-text-muted">{total} events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="widget-box p-4">
        <div className="flex flex-wrap gap-2">
          {['', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
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

      <DataTable
        data={events}
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
