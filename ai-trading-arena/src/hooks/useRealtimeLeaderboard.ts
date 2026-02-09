'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/types/database'

export function useRealtimeLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    const supabase = createClient()

    const { data: models } = await supabase
      .from('ai_models')
      .select('id, name, provider')
      .eq('is_active', true)

    const { data: portfolios } = await supabase
      .from('virtual_portfolios')
      .select('*')

    if (models && portfolios) {
      const combined = models.map(model => {
        const portfolio = portfolios.find(p => p.model_id === model.id)
        const currentBalance = portfolio?.current_balance || 10000
        const initialBalance = portfolio?.initial_balance || 10000
        const roiPercent = ((currentBalance - initialBalance) / initialBalance) * 100
        const totalTrades = portfolio?.total_trades || 0
        const winningTrades = portfolio?.winning_trades || 0
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

        return {
          id: model.id,
          name: model.name,
          provider: model.provider,
          current_balance: currentBalance,
          initial_balance: initialBalance,
          roi_percent: roiPercent,
          total_trades: totalTrades,
          winning_trades: winningTrades,
          win_rate: winRate,
          rank: 0
        }
      })

      // Sort by balance (consistent with landing page)
      combined.sort((a, b) => b.current_balance - a.current_balance)
      combined.forEach((entry, index) => {
        entry.rank = index + 1
      })

      setLeaderboard(combined)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchLeaderboard()

    const supabase = createClient()

    // Subscribe to portfolio changes
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'virtual_portfolios'
        },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeaderboard])

  return { leaderboard, isLoading, error, refetch: fetchLeaderboard }
}
