'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface PerformanceData {
  date: string
  roiBefore: number
  roiAfter: number
}

interface PerformanceImpactChartProps {
  data: PerformanceData[]
  title?: string
  className?: string
}

export function PerformanceImpactChart({
  data,
  title = 'Performance Impact Over Time',
  className,
}: PerformanceImpactChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      improvement: item.roiAfter - item.roiBefore,
    }))
  }, [data])

  const avgImprovement = useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData.reduce((sum, item) => sum + item.improvement, 0) / chartData.length
  }, [chartData])

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          {title}
        </h3>
        <div className="text-sm text-gray-500">
          Avg Improvement:{' '}
          <span className="font-semibold text-green-600">+{avgImprovement.toFixed(2)}%</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name) => {
                const numValue = typeof value === 'number' ? value : 0
                const label = name === 'roiBefore' ? 'ROI Before' : name === 'roiAfter' ? 'ROI After' : 'Improvement'
                return [`${numValue.toFixed(2)}%`, label]
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="roiBefore"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="url(#colorBefore)"
              name="roiBefore"
            />
            <Area
              type="monotone"
              dataKey="roiAfter"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorAfter)"
              name="roiAfter"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded" />
          <span className="text-gray-600">ROI Before</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-600">ROI After</span>
        </div>
      </div>
    </div>
  )
}
