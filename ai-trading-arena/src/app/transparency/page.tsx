import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Transparency - AI Trading Arena',
  description: 'Full transparency on our AI trading performance and methodology'
}

export default async function TransparencyPage() {
  const supabase = await createClient()

  // Fetch aggregate stats
  const { data: portfolios } = await supabase
    .from('virtual_portfolios')
    .select('*')

  const { data: decisions } = await supabase
    .from('ai_decisions')
    .select('id, action, created_at')

  const { data: positions } = await supabase
    .from('virtual_positions')
    .select('id, pnl, closed_at')

  // Calculate stats
  const totalBalance = portfolios?.reduce((sum, p) => sum + (p.current_balance || 0), 0) || 0
  const totalInitial = portfolios?.reduce((sum, p) => sum + (p.initial_balance || 0), 0) || 0
  const totalPnL = totalBalance - totalInitial
  const overallROI = totalInitial > 0 ? ((totalBalance - totalInitial) / totalInitial) * 100 : 0

  const totalTrades = portfolios?.reduce((sum, p) => sum + (p.total_trades || 0), 0) || 0
  const winningTrades = portfolios?.reduce((sum, p) => sum + (p.winning_trades || 0), 0) || 0
  const overallWinRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  const totalDecisions = decisions?.length || 0
  const activeDecisions = decisions?.filter(d => d.action !== 'NO_ACTION').length || 0

  const closedPositions = positions?.filter(p => p.closed_at) || []
  const profitablePositions = closedPositions.filter(p => (p.pnl || 0) > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold">Transparency Report</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Intro */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Full Transparency
              </h2>
              <p className="text-blue-700 dark:text-blue-300">
                We believe in complete transparency. All data shown here is real and updated in real-time
                from our live trading system. No cherry-picking, no hiding losses.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <h2 className="text-xl font-bold mb-4">Key Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-2xl font-bold font-mono",
                totalPnL >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">All 9 models combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                {overallROI >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                Overall ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-2xl font-bold font-mono",
                overallROI >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500">From ${totalInitial.toLocaleString()} initial</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono">
                {overallWinRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{winningTrades}/{totalTrades} trades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Total Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono">
                {totalDecisions}
              </p>
              <p className="text-xs text-gray-500">{activeDecisions} active trades</p>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <h2 className="text-xl font-bold mb-4">System Information</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trading Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Asset</span>
                <Badge>BTCUSD</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Broker</span>
                <span className="font-medium">TradeLocker (E8 Markets)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Execution</span>
                <span className="font-medium">n8n Automation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Decision Interval</span>
                <span className="font-medium">Every 15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Leverage</span>
                <span className="font-medium">5x</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Active Models</span>
                <Badge variant="outline">9</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary">GPT-5.2</Badge>
                <Badge variant="secondary">Claude-Sonnet</Badge>
                <Badge variant="secondary">Gemini-3.0-Pro</Badge>
                <Badge variant="secondary">DeepSeek</Badge>
                <Badge variant="secondary">Mistral</Badge>
                <Badge variant="secondary">GROK-4.1</Badge>
                <Badge variant="secondary">Kimi-k2</Badge>
                <Badge variant="secondary">Qwen3-32B</Badge>
                <Badge variant="secondary">MiMo-V2</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">Disclaimer</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This is an experimental AI trading project. Past performance does not guarantee future results.
                The data shown represents real trading activity but should not be considered financial advice.
                Trade at your own risk.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
