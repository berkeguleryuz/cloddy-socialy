"use client"

import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number | {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  subtitle?: string
  variant?: 'default' | 'warning' | 'success' | 'danger'
  icon: ReactNode
  iconBgColor?: string
  loading?: boolean
}

export default function StatsCard({
  title,
  value,
  change,
  subtitle,
  variant = 'default',
  icon,
  iconBgColor,
  loading = false,
}: StatsCardProps) {
  // Normalize change to object format
  const normalizedChange = typeof change === 'number'
    ? { value: change, type: change >= 0 ? 'increase' as const : 'decrease' as const }
    : change

  // Determine background color based on variant
  const variantColors = {
    default: iconBgColor || 'bg-primary/20',
    warning: 'bg-yellow-500/20',
    success: 'bg-green-500/20',
    danger: 'bg-red-500/20',
  }
  const bgColor = variantColors[variant]

  // Determine text color for value based on variant
  const variantTextColors = {
    default: 'text-white',
    warning: 'text-yellow-400',
    success: 'text-green-400',
    danger: 'text-red-400',
  }

  return (
    <div className="widget-box p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          {loading ? (
            <div className="h-9 w-24 bg-white/10 rounded animate-pulse mt-2" />
          ) : (
            <>
              <p className={`text-3xl font-black mt-2 ${variant === 'default' ? 'text-white' : variantTextColors[variant]}`}>
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-text-muted mt-1">{subtitle}</p>
              )}
            </>
          )}
          {normalizedChange && !loading && (
            <div className="flex items-center gap-1 mt-2">
              {normalizedChange.type === 'increase' ? (
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : normalizedChange.type === 'decrease' ? (
                <svg className="w-4 h-4 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : null}
              <span
                className={`text-sm font-medium ${
                  normalizedChange.type === 'increase'
                    ? 'text-secondary'
                    : normalizedChange.type === 'decrease'
                    ? 'text-accent-orange'
                    : 'text-text-muted'
                }`}
              >
                {normalizedChange.value > 0 ? '+' : ''}{normalizedChange.value}%
              </span>
              {normalizedChange.period && (
                <span className="text-xs text-text-muted">{normalizedChange.period}</span>
              )}
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
