'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, ExternalLink, Activity, Wallet } from 'lucide-react'
import Link from 'next/link'
import { MODEL_CHARACTERS } from '@/lib/constants/models'

interface LeaderboardEntry {
  model_id: string
  model_name: string
  current_balance: number
  realized_pnl: number
  win_rate: number
}

export function LivePreviewSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [stats, setStats] = useState({ activeModels: 9, decisionsToday: 0, totalTrades: 0, avgWinRate: 0 })

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('virtual_portfolios')
          .select(`
            model_id,
            current_balance,
            realized_pnl,
            winning_trades,
            total_trades,
            ai_models!inner(name)
          `)
          .order('current_balance', { ascending: false })
          .limit(5)

        if (error) throw error

        // Fetch live stats in parallel
        const today = new Date().toISOString().split('T')[0]
        const [modelsRes, decisionsRes, allPortfoliosRes] = await Promise.all([
          supabase.from('ai_models').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('ai_decisions').select('id', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('virtual_portfolios').select('total_trades, winning_trades'),
        ])

        const totalTrades = allPortfoliosRes.data?.reduce((sum, p) => sum + (Number(p.total_trades) || 0), 0) || 0
        const totalWins = allPortfoliosRes.data?.reduce((sum, p) => sum + (Number(p.winning_trades) || 0), 0) || 0
        setStats({
          activeModels: modelsRes.count || 9,
          decisionsToday: decisionsRes.count || 0,
          totalTrades,
          avgWinRate: totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0,
        })

        const formatted = data?.map(item => ({
          model_id: item.model_id,
          model_name: (item.ai_models as any)?.name || 'Unknown',
          current_balance: Number(item.current_balance) || 0,
          realized_pnl: Number(item.realized_pnl) || 0,
          win_rate: Number(item.total_trades) > 0 ? (Number(item.winning_trades) / Number(item.total_trades)) * 100 : 0,
        })) || []

        setLeaderboard(formatted)
        setLastUpdate(new Date())
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const getModelCharacter = (name: string) => {
    return MODEL_CHARACTERS.find(m => m.name === name) || MODEL_CHARACTERS[0]
  }

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.1),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.1),transparent_40%)]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-4 h-4" />
            </motion.div>
            LIVE - Updated {lastUpdate ? `${Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago` : 'just now'}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Current Standings
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time competition results. See who's winning right now.
          </p>
        </motion.div>

        {/* Mini Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800/50 border-b border-gray-700 text-sm font-medium text-gray-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Model</div>
              <div className="col-span-3 text-right">Balance</div>
              <div className="col-span-3 text-right">P&L</div>
            </div>

            {/* Entries */}
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading live data...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No data available
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {leaderboard.map((entry, index) => {
                  const character = getModelCharacter(entry.model_name)
                  const isPositive = entry.realized_pnl >= 0

                  return (
                    <motion.div
                      key={entry.model_id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-700/20 transition-colors"
                    >
                      <div className="col-span-1 flex items-center">
                        <span className={`text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {getRankMedal(index + 1)}
                        </span>
                      </div>
                      <div className="col-span-5 flex items-center gap-3">
                        <span className="text-2xl">{character.emoji}</span>
                        <div>
                          <div className="text-white font-medium flex items-center gap-2">
                            {entry.model_name}
                            {index === 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                                <Wallet className="w-2.5 h-2.5" />
                                Real Trading
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${character.color}`}>{character.provider}</div>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center justify-end">
                        <span className="text-white font-mono">
                          ${entry.current_balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}${entry.realized_pnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Champion Info */}
            <div className="px-6 py-3 bg-rose-500/5 border-t border-rose-500/20">
              <p className="text-center text-xs text-rose-400/80">
                The #1 ranked champion&apos;s decisions are automatically executed as real trades on Bitget
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700">
              <Link
                href="/leaderboard"
                className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 transition-colors font-medium"
              >
                View Full Leaderboard
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
        >
          {[
            { label: 'Active Models', value: String(stats.activeModels) },
            { label: 'Decisions Today', value: stats.decisionsToday.toLocaleString() },
            { label: 'Total Trades', value: stats.totalTrades.toLocaleString() },
            { label: 'Avg Win Rate', value: `${stats.avgWinRate}%` },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
