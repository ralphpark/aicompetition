'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { ChartContainer, ChartTooltip, CHART_COLORS } from '@/components/ui/chart'

interface ROIDataPoint {
  date: string
  roi: number
  [key: string]: string | number
}

interface ROIChartProps {
  data: ROIDataPoint[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  modelName?: string
  color?: string
}

export function ROIChart({
  data,
  height = 300,
  showGrid = true,
  showLegend = false,
  modelName = 'ROI',
  color = CHART_COLORS.primary,
}: ROIChartProps) {
  const formatROI = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <ChartContainer height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tickFormatter={formatROI}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={{ stroke: '#e5e7eb' }}
          domain={['auto', 'auto']}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload as never}
              label={label != null ? String(label) : undefined}
              formatter={(value) => formatROI(value)}
              labelFormatter={(l) => formatDate(l)}
            />
          )}
        />
        {showLegend && <Legend />}
        <ReferenceLine
          y={0}
          stroke="#9ca3af"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <Line
          type="monotone"
          dataKey="roi"
          name={modelName}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ChartContainer>
  )
}

// Multi-model ROI comparison chart
interface MultiModelROIChartProps {
  data: ROIDataPoint[]
  models: Array<{ id: string; name: string; color: string }>
  height?: number
}

export function MultiModelROIChart({
  data,
  models,
  height = 400,
}: MultiModelROIChartProps) {
  const formatROI = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <ChartContainer height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatROI}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload as never}
              label={label != null ? String(label) : undefined}
              formatter={(value) => formatROI(value)}
              labelFormatter={(l) => formatDate(l)}
            />
          )}
        />
        <Legend />
        <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
        {models.map((model) => (
          <Line
            key={model.id}
            type="monotone"
            dataKey={model.id}
            name={model.name}
            stroke={model.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: model.color }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
