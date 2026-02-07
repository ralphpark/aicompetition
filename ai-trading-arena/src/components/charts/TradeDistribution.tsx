'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { ChartContainer, ChartLegend, CHART_COLORS } from '@/components/ui/chart'

// Trade action distribution
interface ActionDistributionData {
  action: string
  count: number
  color: string
}

interface ActionDistributionChartProps {
  data: ActionDistributionData[]
  height?: number
  variant?: 'bar' | 'pie'
}

export function ActionDistributionChart({
  data,
  height = 200,
  variant = 'bar',
}: ActionDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (variant === 'pie') {
    return (
      <div className="flex flex-col items-center">
        <ChartContainer height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="count"
              nameKey="action"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as ActionDistributionData
                return (
                  <div className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-lg">
                    <div className="font-medium">{item.action}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.count} trades ({(item.count / total * 100).toFixed(1)}%)
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ChartContainer>
        <ChartLegend
          items={data.map(d => ({ name: d.action, color: d.color }))}
          className="mt-2"
        />
      </div>
    )
  }

  return (
    <ChartContainer height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />
        <XAxis
          dataKey="action"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as ActionDistributionData
            return (
              <div className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-lg">
                <div className="font-medium">{item.action}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.count} trades ({(item.count / total * 100).toFixed(1)}%)
                </div>
              </div>
            )
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// P&L Distribution histogram
interface PnLBucket {
  range: string
  count: number
  isProfit: boolean
}

interface PnLDistributionChartProps {
  data: PnLBucket[]
  height?: number
}

export function PnLDistributionChart({ data, height = 250 }: PnLDistributionChartProps) {
  return (
    <ChartContainer height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />
        <XAxis
          dataKey="range"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          label={{ value: 'Trades', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as PnLBucket
            return (
              <div className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-lg">
                <div className="font-medium">{item.range}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.count} trades
                </div>
              </div>
            )
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isProfit ? CHART_COLORS.primary : CHART_COLORS.danger}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// Model trade count comparison
interface ModelTradeCountData {
  name: string
  trades: number
  color: string
}

interface TradeCountChartProps {
  data: ModelTradeCountData[]
  height?: number
}

export function TradeCountChart({ data, height = 300 }: TradeCountChartProps) {
  return (
    <ChartContainer height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          type="number"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          width={80}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as ModelTradeCountData
            return (
              <div className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-lg">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Trades: {item.trades}
                </div>
              </div>
            )
          }}
        />
        <Bar
          dataKey="trades"
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// Default action colors helper
export function getActionColors(): Record<string, string> {
  return {
    'OPEN_LONG': CHART_COLORS.primary,
    'CLOSE_LONG': '#86efac', // green-300
    'OPEN_SHORT': CHART_COLORS.danger,
    'CLOSE_SHORT': '#fca5a5', // red-300
    'NO_ACTION': CHART_COLORS.neutral,
  }
}
