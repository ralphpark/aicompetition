'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BitgetAccountConfig, BitgetTradeExecution, BitgetAccountStats } from '@/types/database'

export function useBitgetRealtime() {
  const [config, setConfig] = useState<BitgetAccountConfig | null>(null)
  const [trades, setTrades] = useState<BitgetTradeExecution[]>([])
  const [stats, setStats] = useState<BitgetAccountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stable supabase client reference
  const supabase = useMemo(() => createClient(), [])

  // Use ref for config to avoid dependency issues
  const configRef = useRef<BitgetAccountConfig | null>(null)
  configRef.current = config

  // Calculate stats from trades
  const calculateStats = useCallback((tradeList: BitgetTradeExecution[], accountConfig: BitgetAccountConfig | null): BitgetAccountStats => {
    const closedTrades = tradeList.filter(t => t.position_status === 'CLOSED' && t.status === 'SUCCESS')
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0).length
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    const initialBalance = accountConfig?.initial_balance || 10000
    const currentBalance = initialBalance + totalPnl
    const roi = initialBalance > 0 ? ((currentBalance - initialBalance) / initialBalance) * 100 : 0
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0

    return {
      totalTrades: closedTrades.length,
      winningTrades,
      losingTrades,
      winRate,
      totalPnl,
      roi,
      currentBalance,
      initialBalance
    }
  }, [])

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
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
    } catch (err) {
      console.error('Error fetching bitget data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, calculateStats])

  // Set up realtime subscription - runs only once
  useEffect(() => {
    fetchData()

    // Subscribe to trade executions
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
        }
      )
      .subscribe()

    // Subscribe to config changes
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
        }
      )
      .subscribe()

    return () => {
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
    refetch: fetchData
  }
}
