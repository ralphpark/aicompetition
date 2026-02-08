'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BitgetAccountConfig, BitgetTradeExecution, BitgetAccountStats } from '@/types/database'

const POLL_INTERVAL = 30_000 // 30 seconds

export function useBitgetRealtime() {
  const [config, setConfig] = useState<BitgetAccountConfig | null>(null)
  const [trades, setTrades] = useState<BitgetTradeExecution[]>([])
  const [stats, setStats] = useState<BitgetAccountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Stable supabase client reference
  const supabase = useMemo(() => createClient(), [])

  // Use ref for config to avoid dependency issues
  const configRef = useRef<BitgetAccountConfig | null>(null)
  configRef.current = config

  // Calculate stats from trades
  const calculateStats = useCallback((tradeList: BitgetTradeExecution[], accountConfig: BitgetAccountConfig | null): BitgetAccountStats => {
    // Only count CLOSE trades for PnL (they have the realized PnL)
    const closeTrades = tradeList.filter(t => t.action.startsWith('CLOSE') && t.status === 'SUCCESS')
    const winningTrades = closeTrades.filter(t => (t.pnl || 0) > 0).length
    const losingTrades = closeTrades.filter(t => (t.pnl || 0) <= 0).length
    const totalPnl = closeTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    // Sum all fees from all successful trades (open + close)
    const allSuccessful = tradeList.filter(t => t.status === 'SUCCESS')
    const totalFees = allSuccessful.reduce((sum, t) => sum + (t.fee || 0), 0)
    const netPnl = totalPnl - totalFees

    const initialBalance = accountConfig?.initial_balance || 10000
    const currentBalance = initialBalance + netPnl
    const roi = initialBalance > 0 ? ((currentBalance - initialBalance) / initialBalance) * 100 : 0
    const winRate = closeTrades.length > 0 ? (winningTrades / closeTrades.length) * 100 : 0

    return {
      totalTrades: closeTrades.length,
      winningTrades,
      losingTrades,
      winRate,
      totalPnl,
      totalFees,
      netPnl,
      roi,
      currentBalance,
      initialBalance
    }
  }, [])

  // Fetch data (used for initial load + polling)
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)

    try {
      // Fetch config
      const { data: configData, error: configError } = await supabase
        .from('bitget_account_config')
        .select('*')
        .eq('is_active', true)
        .single()

      if (configError && configError.code !== 'PGRST116') {
        throw configError
      }

      setConfig(configData)
      configRef.current = configData

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('bitget_trade_executions')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100)

      if (tradesError) throw tradesError

      setTrades(tradesData || [])
      setStats(calculateStats(tradesData || [], configData))
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching bitget data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [supabase, calculateStats])

  // Set up realtime subscription + polling
  useEffect(() => {
    fetchData()

    // --- Polling fallback (every 30s, silent) ---
    const pollTimer = setInterval(() => {
      fetchData(false)
    }, POLL_INTERVAL)

    // --- Supabase Realtime (instant updates) ---
    const tradesChannel = supabase
      .channel('bitget_trades_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bitget_trade_executions'
        },
        (payload) => {
          console.log('Bitget trade update:', payload)

          if (payload.eventType === 'INSERT') {
            setTrades(prev => {
              const newTrades = [payload.new as BitgetTradeExecution, ...prev]
              setStats(calculateStats(newTrades, configRef.current))
              return newTrades
            })
          } else if (payload.eventType === 'UPDATE') {
            setTrades(prev => {
              const newTrades = prev.map(t =>
                t.id === payload.new.id ? payload.new as BitgetTradeExecution : t
              )
              setStats(calculateStats(newTrades, configRef.current))
              return newTrades
            })
          }
          setLastUpdated(new Date())
        }
      )
      .subscribe()

    const configChannel = supabase
      .channel('bitget_config_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bitget_account_config'
        },
        (payload) => {
          console.log('Bitget config update:', payload)
          setConfig(payload.new as BitgetAccountConfig)
          setLastUpdated(new Date())
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollTimer)
      supabase.removeChannel(tradesChannel)
      supabase.removeChannel(configChannel)
    }
  }, [supabase, fetchData, calculateStats])

  return {
    config,
    trades,
    stats,
    isLoading,
    error,
    lastUpdated,
    refetch: () => fetchData(false)
  }
}
