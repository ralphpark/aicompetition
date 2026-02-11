import { createClient } from '@/lib/supabase/server'
import { getModelCharacter, MODEL_CHARACTERS } from '@/lib/constants/models'
import { StatsPanel } from '@/components/dashboard/StatsPanel'
import { DecisionFeed } from '@/components/decision/DecisionFeed'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, History, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch model info
  const { data: model } = await supabase
    .from('ai_models')
    .select('*')
    .eq('id', id)
    .single()

  if (!model) {
    notFound()
  }

  // Fetch portfolio
  const { data: portfolio } = await supabase
    .from('virtual_portfolios')
    .select('*')
    .eq('model_id', id)
    .single()

  // Fetch current position
  const { data: positions } = await supabase
    .from('virtual_positions')
    .select('*')
    .eq('model_id', id)
    .is('closed_at', null)

  const currentPosition = positions?.[0]
  const character = getModelCharacter(id)

  const stats = {
    current_balance: portfolio?.current_balance ?? 10000,
    initial_balance: portfolio?.initial_balance ?? 10000,
    total_trades: portfolio?.total_trades || 0,
    winning_trades: portfolio?.winning_trades || 0,
    roi_percent: portfolio ? ((portfolio.current_balance - portfolio.initial_balance) / portfolio.initial_balance) * 100 : 0,
    win_rate: portfolio?.total_trades > 0 ? (portfolio.winning_trades / portfolio.total_trades) * 100 : 0,
    currentPosition: currentPosition ? {
      side: currentPosition.side as 'LONG' | 'SHORT',
      entry_price: currentPosition.entry_price,
      pnl: currentPosition.pnl,
      stop_loss: currentPosition.stop_loss,
      take_profit: currentPosition.take_profit,
    } : { side: null }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Arena
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Model Header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">{character?.emoji || '🤖'}</span>
          <div>
            <h1 className="text-3xl font-bold">{model.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{model.provider}</Badge>
              {character && (
                <span className="text-gray-500 italic">"{character.catchphrase}"</span>
              )}
            </div>
            {character && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{character.personality}</p>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={`/models/${id}/history`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="w-4 h-4" />
            Trade History
          </Link>
          <Link
            href={`/models/${id}/prompts`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Prompt History
          </Link>
        </div>

        {/* Stats Panel */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
          <StatsPanel stats={stats} />
        </div>

        {/* Current Position Details */}
        {currentPosition && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Current Position</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500">Side</p>
                <Badge className={currentPosition.side === 'LONG' ? 'bg-green-500' : 'bg-red-500'}>
                  {currentPosition.side}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Entry Price</p>
                <p className="font-mono font-bold">${currentPosition.entry_price?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stop Loss</p>
                <p className="font-mono text-red-600">${currentPosition.stop_loss?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Take Profit</p>
                <p className="font-mono text-green-600">${currentPosition.take_profit?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unrealized P&L</p>
                <p className={`font-mono font-bold ${(currentPosition.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${currentPosition.pnl?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            {/* Exit Plan / Invalidation */}
            {(currentPosition.invalidation_type || currentPosition.confidence_at_entry) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {currentPosition.confidence_at_entry && (
                  <div>
                    <p className="text-sm text-gray-500">Confidence at Entry</p>
                    <p className="font-mono font-bold">{currentPosition.confidence_at_entry}%</p>
                  </div>
                )}
                {currentPosition.invalidation_type && (
                  <div>
                    <p className="text-sm text-gray-500">Invalidation Type</p>
                    <p className="font-semibold text-amber-600">{currentPosition.invalidation_type}</p>
                  </div>
                )}
                {currentPosition.invalidation_value && (
                  <div>
                    <p className="text-sm text-gray-500">Invalidation Price</p>
                    <p className="font-mono font-bold text-amber-600">${currentPosition.invalidation_value?.toLocaleString()}</p>
                  </div>
                )}
                {currentPosition.invalidation_description && (
                  <div className="md:col-span-1">
                    <p className="text-sm text-gray-500">Exit Condition</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{currentPosition.invalidation_description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Decision History */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Decision History</h2>
          <DecisionFeed modelId={id} limit={20} showModel={false} />
        </div>
      </main>
    </div>
  )
}
