'use client'

import * as React from 'react'
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
} from 'recharts'
import { cn } from '@/lib/utils'

// Chart container with consistent styling
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  height?: number | string
}

export function ChartContainer({
  children,
  className,
  height = 300,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

// Custom tooltip component
interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
    payload: Record<string, unknown>
  }>
  label?: string
  formatter?: (value: number, name: string) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-900 p-3 shadow-lg">
      {label && (
        <div className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart legend component
interface ChartLegendItem {
  name: string
  color: string
}

interface ChartLegendProps {
  items: ChartLegendItem[]
  className?: string
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
        </div>
      ))}
    </div>
  )
}

// Color palette for charts
export const CHART_COLORS = {
  primary: '#22c55e', // green-500
  secondary: '#3b82f6', // blue-500
  accent: '#8b5cf6', // purple-500
  warning: '#eab308', // yellow-500
  danger: '#ef4444', // red-500
  neutral: '#6b7280', // gray-500

  // Provider colors
  openai: '#10a37f',
  anthropic: '#d97706',
  google: '#8b5cf6',
  deepseek: '#06b6d4',
  mistral: '#3b82f6',
  groq: '#ef4444',
  openrouter: '#eab308',

  // Gradient
  gradient: {
    start: '#22c55e',
    end: '#3b82f6',
  },
}

// Common chart config
export const CHART_CONFIG = {
  grid: {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
    darkStroke: '#374151',
  },
  axis: {
    tick: { fill: '#6b7280', fontSize: 12 },
    axisLine: { stroke: '#e5e7eb' },
    darkAxisLine: { stroke: '#374151' },
  },
  animation: {
    duration: 500,
    easing: 'ease-out',
  },
}

// Type for chart data point
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// Export recharts components for convenience
export { ResponsiveContainer, RechartsTooltip }
