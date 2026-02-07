'use client'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartLegend, CHART_COLORS } from '@/components/ui/chart'

interface WinLossData {
  wins: number
  losses: number
  breakeven?: number
}

interface WinRatePieChartProps {
  data: WinLossData
  height?: number
  showLegend?: boolean
}

export function WinRatePieChart({
  data,
  height = 200,
  showLegend = true,
}: WinRatePieChartProps) {
  const total = data.wins + data.losses + (data.breakeven || 0)
  const winRate = total > 0 ? (data.wins / total * 100).toFixed(1) : '0'

  const chartData = [
    { name: 'Wins', value: data.wins, color: CHART_COLORS.primary },
    { name: 'Losses', value: data.losses, color: CHART_COLORS.danger },
    ...(data.breakeven ? [{ name: 'Breakeven', value: data.breakeven, color: CHART_COLORS.neutral }] : []),
  ]

  return (
    <div className="flex flex-col items-center">
      <ChartContainer height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0]
              return (
                <div className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.payload.color }}
                    />
                    <span className="text-sm">
                      {item.name}: {item.value} ({((item.value as number) / total * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )
            }}
          />
        </PieChart>
      </ChartContainer>

      {/* Center label */}
      <div className="relative -mt-[calc(50%+20px)] flex flex-col items-center pointer-events-none">
        <span className="text-2xl font-bold">{winRate}%</span>
        <span className="text-xs text-gray-500">Win Rate</span>
      </div>

      {showLegend && (
        <ChartLegend
          items={chartData.map(d => ({ name: `${d.name} (${d.value})`, color: d.color }))}
          className="mt-4"
        />
      )}
    </div>
  )
}

// Win rate comparison bar chart
interface ModelWinRateData {
  name: string
  winRate: number
  color: string
}

interface WinRateBarChartProps {
  data: ModelWinRateData[]
  height?: number
}

export function WinRateBarChart({ data, height = 300 }: WinRateBarChartProps) {
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
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
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
            const item = payload[0].payload as ModelWinRateData
            return (
              <div className="rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-lg">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Win Rate: {item.winRate.toFixed(1)}%
                </div>
              </div>
            )
          }}
        />
        <Bar
          dataKey="winRate"
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

// Simple win rate progress bar
interface WinRateProgressProps {
  winRate: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function WinRateProgress({
  winRate,
  size = 'md',
  showLabel = true,
}: WinRateProgressProps) {
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const barColor = winRate >= 50 ? CHART_COLORS.primary : CHART_COLORS.danger

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-500">Win Rate</span>
          <span className="font-medium">{winRate.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500`}
          style={{
            width: `${Math.min(winRate, 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  )
}
