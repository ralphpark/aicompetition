import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MODEL_CHARACTERS } from '@/lib/constants/models'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const model = MODEL_CHARACTERS.find(m => m.id === id)

  return {
    title: model ? `${model.name} Trade History - AI Trading Arena` : 'Trade History - AI Trading Arena',
    description: model ? `Complete trade history for ${model.name} in the AI Trading Arena` : 'Trade history',
  }
}

export default async function ModelHistoryPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const model = MODEL_CHARACTERS.find(m => m.id === id)
  if (!model) {
    notFound()
  }

  // Fetch closed positions (trade history)
  const { data: trades } = await supabase
    .from('virtual_positions')
    .select('*')
    .eq('model_id', id)
    .not('closed_at', 'is', null)
    .order('closed_at', { ascending: false })
    .limit(100)

  // Calculate stats
  const totalTrades = trades?.length || 0
  const winningTrades = trades?.filter(t => (t.pnl || 0) > 0).length || 0
  const losingTrades = trades?.filter(t => (t.pnl || 0) < 0).length || 0
  const totalPnL = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/models/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {model.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">{model.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{model.name} Trade History</h1>
            <p className="text-gray-600 dark:text-gray-400">{model.provider}</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalTrades}</div>
              <div className="text-sm text-gray-500">Total Trades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{winningTrades}</div>
              <div className="text-sm text-gray-500">Winning Trades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{losingTrades}</div>
              <div className="text-sm text-gray-500">Losing Trades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* P&L Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>P&L Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total P&L</div>
                <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USDT
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Average P&L per Trade</div>
                <div className={`text-3xl font-bold ${avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {avgPnL >= 0 ? '+' : ''}{avgPnL.toFixed(2)} USDT
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            {trades && trades.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead className="text-right">Entry</TableHead>
                      <TableHead className="text-right">Exit</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => {
                      const pnl = trade.pnl || 0
                      const isWin = pnl > 0
                      const isLoss = pnl < 0

                      return (
                        <TableRow key={trade.id}>
                          <TableCell className="whitespace-nowrap">
                            {trade.closed_at ? formatDate(trade.closed_at) : '-'}
                          </TableCell>
                          <TableCell className="font-mono">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={trade.side === 'LONG' ? 'default' : 'destructive'}>
                              {trade.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${Number(trade.entry_price).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${Number(trade.current_price).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {Number(trade.quantity).toFixed(6)}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${isWin ? 'text-green-600' : isLoss ? 'text-red-600' : ''}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {isWin ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : isLoss ? (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-400" />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No completed trades yet.</p>
                <p className="text-sm mt-2">Trades will appear here once positions are closed.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
